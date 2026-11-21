# MediCure AI — Full-stack deployment

## Why Dr. Nova was failing on the Vercel static deployment

The frontend calls `POST /api/ai-assistant`. That endpoint is implemented in the Express server (`server.ts`), not as a Vercel serverless function. A Vite static deployment on Vercel builds and serves the frontend but does not automatically run this Express API, so Dr. Nova's request can fail even when Supabase login works.

## Deploy the whole app on Render (frontend + Express API on one origin)

1. Push this project to a GitHub repository. Do **not** commit `.env` or any secret keys.
2. In Render, choose **New → Blueprint** and connect the repository containing this `render.yaml`.
3. Render will create a web service named `medicure-ai` using the build and start commands in the blueprint.
4. In the service's Environment settings, set:
   - `GEMINI_API_KEY` — your Google AI Studio/Gemini API key (required for live AI answers)
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase publishable/anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — optional server-only Supabase service-role key; never put this in a `VITE_` variable or expose it to the browser. If you choose not to set it, the server currently falls back to the anon key.
5. Save environment variables and let Render deploy. Open the Render service URL. Because Express serves the built Vite frontend and the API together, `/api/ai-assistant` uses the same origin.

## Notes
- Vercel's current static deployment can continue to serve the frontend, but it will not provide this Express API as configured. For the simplest setup, use the Render URL for both the app UI and API.
- `GEMINI_API_KEY` is server-side only. Never add it to a `VITE_` variable, commit it, or share it in screenshots.
- After changing any environment variables, trigger a new deploy so Vite can bake its public Supabase settings into the frontend build.
