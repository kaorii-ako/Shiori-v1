// Client-side Gemini API wrapper using REST
// Uses stored API key from Settings if server endpoint fails

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

function getStoredKey() {
  try {
    const state = JSON.parse(localStorage.getItem('shiori-ui') || '{}')
    return state?.state?.geminiApiKey || null
  } catch { return null }
}

export async function callGeminiClient(prompt) {
  const key = getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) return null

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
    })
  })

  if (!res.ok) return null
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

export function hasClientKey() {
  return !!(getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY)
}
