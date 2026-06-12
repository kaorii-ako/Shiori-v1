// Client-side Gemini API wrapper using REST
// Uses stored API key from Settings if server endpoint fails

// Tried in order — older models get retired, so fall through until one answers.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
const geminiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

function getStoredKey() {
  try {
    const state = JSON.parse(localStorage.getItem('shiori-ui') || '{}')
    return state?.state?.geminiApiKey || null
  } catch { return null }
}

export async function callGeminiClient(prompt, { maxOutputTokens = 2048, temperature = 0.7 } = {}) {
  const key = getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) return null

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`${geminiUrl(model)}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens, temperature }
        })
      })
      if (res.status === 404) continue // model retired — try the next one
      if (!res.ok) return null
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
    } catch {
      return null
    }
  }
  return null
}

export function hasClientKey() {
  return !!(getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY)
}
