# Franco Jasso — Professional Portfolio

A modern, fintech-inspired portfolio site for **Franco Ángel Jasso Osorio**, Mechatronics Engineer. The site presents career highlights, education, and skills, and includes an AI career assistant powered by the Google Gemini API.

**Live site:** [https://franco-jasso-portfolio.onrender.com](https://franco-jasso-portfolio.onrender.com)

---

## Features

- Responsive layout with a blue-forward visual identity
- Hero summary cards for experience, skills, and education
- Timeline of professional experience and an education carousel
- Technical and soft skills sections, plus language proficiency
- Floating AI assistant that answers questions using profile data from `data/profile.json` only

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js, Express (`server.mjs`) |
| AI | Google Gemini API (`@google/genai`) |
| Hosting | [Render](https://render.com) |

An optional Python server (`server.py`) is included for local development alternatives.

---

## Project Structure

```
├── index.html          # Page markup
├── css/styles.css      # Styles
├── js/                 # Chatbot, carousel, scroll animations
├── data/profile.json   # Source of truth for the AI assistant
├── assets/             # Logos and images
├── server.mjs          # Production server (Node)
└── render.yaml         # Render deployment blueprint
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GENAI_API_KEY` | Google Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey)). Also accepts `GOOGLE_API_KEY` or `GEMINI_API_KEY`. |
| `GENAI_PROVIDER` | Set to `google` for public hosting. Use `openai` only with a compatible corporate endpoint. |
| `GENAI_MODEL` | Gemini model ID (default: `gemini-2.5-flash`). |
| `GENAI_API_BASE` | Optional. Required only for OpenAI-compatible corporate gateways. |
| `PORT` | Server port (default: `5000`). |

Copy `.env.example` to `.env` for local development. Never commit `.env` to version control.

---

## Customization

- **Content:** `data/profile.json` and `index.html`
- **Styling:** `css/styles.css`

---

## Security

- Keep API keys in environment variables only; do not expose them in the client.
- The assistant is constrained to information defined in `data/profile.json` via server-side system instructions.

---

## Repository

[github.com/franco-jasso/my-resume-chatbot](https://github.com/franco-jasso/my-resume-chatbot)

---

© 2026 Franco Jasso. All rights reserved.
