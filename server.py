"""
Servidor local: sirve el portafolio y expone /api/chat con Google Gemini (GenAI).
Configura GENAI_API_KEY en .env (o la variable que use tu entorno corporativo).
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
PROFILE_PATH = ROOT / "data" / "profile.json"

app = Flask(__name__, static_folder=str(ROOT), static_url_path="")
CORS(app)

LANGUAGE_RULE = """CRITICAL — OUTPUT LANGUAGE: You MUST write every response in English only.
Never reply in Spanish, French, or any other language, even if the user writes in another language.
If the user asks in Spanish, still answer in English."""

SYSTEM_PROMPT = """You are the virtual assistant for Franco Ángel Jasso Osorio's professional portfolio website (English).

{language_rule}

You may only discuss Franco, his career, education, skills, experience, and languages.
If asked about anything else, politely explain that you can only help with Franco's professional information.
Be concise, professional, and friendly. Do not invent facts that are not in the profile.

FULL PROFILE (source of truth):
{profile}
"""


def load_profile_text() -> str:
    with open(PROFILE_PATH, encoding="utf-8") as f:
        return json.dumps(json.load(f), ensure_ascii=False, indent=2)


def get_genai_client():
    api_key = (
        os.getenv("GENAI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )
    if not api_key:
        return None, "Falta GENAI_API_KEY (o GOOGLE_API_KEY) en .env"

    try:
        from google import genai
    except ImportError:
        return None, "Instala dependencias: pip install -r requirements.txt"

    client_kwargs = {"api_key": api_key}
    base_url = os.getenv("GENAI_API_BASE") or os.getenv("GOOGLE_API_BASE")
    if base_url:
        client_kwargs["http_options"] = {"base_url": base_url.rstrip("/")}

    return genai.Client(**client_kwargs), None


@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/<path:path>")
def static_files(path):
    full = ROOT / path
    if full.is_file():
        return send_from_directory(ROOT, path)
    return send_from_directory(ROOT, "index.html")


@app.route("/api/health")
def health():
    client, err = get_genai_client()
    return jsonify({
        "ok": True,
        "genai_configured": client is not None,
        "genai_error": err,
        "model": os.getenv("GENAI_MODEL", "gemini-2.0-flash"),
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Mensaje vacío"}), 400

    client, err = get_genai_client()
    if not client:
        return jsonify({"error": err}), 503

    model = os.getenv("GENAI_MODEL", "gemini-2.0-flash")
    profile = load_profile_text()
    system = SYSTEM_PROMPT.format(profile=profile, language_rule=LANGUAGE_RULE)

    prior = body.get("history") or []
    contents = []
    for turn in prior[:-1]:
        role = turn.get("role", "user")
        text = turn.get("content", "")
        if not text:
            continue
        gemini_role = "model" if role == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": text}]})
    contents.append({
        "role": "user",
        "parts": [{"text": f"[Answer in English only] {message}"}],
    })

    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config={
                "system_instruction": system,
                "temperature": 0.4,
                "max_output_tokens": 1024,
            },
        )
        reply = (response.text or "").strip()
        if not reply:
            reply = "No pude generar una respuesta. Intenta reformular tu pregunta."
        return jsonify({"reply": reply})
    except Exception as exc:
        app.logger.exception("GenAI error")
        return jsonify({"error": f"Error del modelo: {exc}"}), 502


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    print(f"Portafolio: http://127.0.0.1:{port}")
    print("Health:     http://127.0.0.1:{0}/api/health".format(port))
    app.run(host="127.0.0.1", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
