# Portafolio profesional — Franco Jasso

Sitio web de carrera profesional inspirado en un diseño fintech (paleta **azul** en lugar de morado), con chatbot integrado powered by **Google Gemini** (GenAI).

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

## Publicar en internet (Render — gratis)

Tu sitio usa un servidor Node.js (no solo HTML), así que necesitas un hosting que ejecute Node. **Render** es la opción más simple y tiene plan gratuito.

### Importante: API del chatbot

| Entorno | API |
|---------|-----|
| Local en PwC (VPN) | `GENAI_PROVIDER=openai` + `GENAI_API_BASE` corporativa |
| **Internet público** | `GENAI_PROVIDER=google` + clave de [Google AI Studio](https://aistudio.google.com/apikey) |

La URL `pwcinternal.com` **no funciona** desde internet; en producción usa Google Gemini.

### Pasos

1. **Crea un repositorio en GitHub** (vacío, público o privado).

2. **Sube el código** (en PowerShell, desde la carpeta del proyecto):

   ```powershell
   git init
   git add .
   git commit -m "Portfolio listo para deploy"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

3. **Cuenta en [Render](https://render.com)** → *New* → *Blueprint* (o *Web Service* conectado a GitHub).

4. **Variables de entorno** en el panel de Render:

   | Variable | Valor |
   |----------|--------|
   | `GENAI_API_KEY` | Tu clave de Google AI Studio |
   | `GENAI_PROVIDER` | `google` |
   | `GENAI_MODEL` | `gemini-2.0-flash` |

   No configures `GENAI_API_BASE` en producción con Google.

5. Tras el deploy, Render te dará una URL como `https://franco-jasso-portfolio.onrender.com`.

6. Comprueba: `https://TU-URL.onrender.com/api/health` debe mostrar `"genai_configured": true`.

### Alternativas

- **Railway**, **Fly.io** — mismo flujo: repo Git + `npm start` + variables de entorno.
- **Solo HTML sin chatbot** — Netlify/GitHub Pages; habría que quitar o externalizar `/api/chat`.
