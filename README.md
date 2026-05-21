# Portafolio profesional — Franco Jasso

Sitio web de carrera profesional inspirado en un diseño fintech con chatbot integrado powered by **Google Gemini** (GenAI).

## Contenido

- Hero con tarjetas de resumen (experiencia, habilidades, formación)
- Secciones de confianza, competencias, estadísticas, experiencia, educación y contacto
- Chat flotante para preguntar sobre tu carrera (usa solo datos de tu CV)

## Requisitos

- API key corporativa de GenAI (Google Gemini)
- **Node.js 18+** (recomendado) o Python 3.10+

## Instalación

```bash
cd "CV_web_page"
copy .env.example .env
```

Edita `.env` y agrega tu clave:

```
GENAI_API_KEY=tu_clave_corporativa
```

### Opción A — Node.js (recomendado)

```bash
npm install
npm start
```

### Opción B — Python

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Abre [http://127.0.0.1:5000](http://127.0.0.1:5000)

Verifica la API en [http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health)

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GENAI_API_KEY` | Clave principal (también acepta `GOOGLE_API_KEY` o `GEMINI_API_KEY`) |
| `GENAI_MODEL` | Modelo Gemini (por defecto `gemini-2.0-flash`) |
| `GENAI_API_BASE` | URL base opcional si tu empresa usa proxy corporativo |
| `PORT` | Puerto (por defecto `5000`) |

## Personalizar

- Textos y datos: `data/profile.json` e `index.html`
- Estilos (colores azules): `css/styles.css`

## Notas de seguridad

- No subas `.env` a repositorios públicos
- El chatbot solo responde con información del perfil cargado en el servidor
