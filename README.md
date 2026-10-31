# 🕵️ El Impostor

Juego de fiesta para un solo celular (pass-and-play), hecho con Next.js (App Router), TypeScript y Tailwind.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # opcional: solo si quieres IA
npm run dev                  # http://localhost:3000
```

Producción: `npm run build && npm start`.

## IA (opcional)

Gemini solo se usa para **generar categorías propias** desde un tema libre. Si `GEMINI_API_KEY` está vacío,
el botón de IA no aparece y el juego funciona completo con las categorías integradas.

```env
GEMINI_API_KEY=tu_api_key
GEMINI_MODEL=gemini-2.5-flash
```

La key se lee solo en el servidor (`src/app/api/words/route.ts`); nunca llega al navegador.

## Qué incluye

- 3 a 20 jugadores, en un solo dispositivo.
- 0, 1 o varios impostores, y **modo sorpresa** (cantidad al azar entre 0 y el máximo).
- Pista vaga opcional para el impostor.
- Temporizador de debate (1, 2, 3 o 5 min).
- Votación con eliminación por rondas, opción «creo que no hay impostor» y última oportunidad de adivinar la palabra.
- Botón **Ayuda** con el paso a paso (se abre solo la primera vez).
- PWA instalable (manifest + service worker, activo en producción).

## Estructura

- `src/lib/words.ts`: categorías integradas.
- `src/lib/game.ts`: reparto de roles y reglas de votación.
- `src/components/`: pantallas (configuración, reparto, debate, votación, final) y ayuda.
