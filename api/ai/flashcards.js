let geminiModel = null

async function getGemini() {
  if (geminiModel) return geminiModel
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(key)
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    return geminiModel
  } catch {
    return null
  }
}

function fallbackExtract(content) {
  const lines = content.split('\n')
  const cards = []
  let lastHeading = null
  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      lastHeading = line.replace(/^#{1,3}\s/, '').trim()
    } else if (/^[-*]\s/.test(line) && lastHeading) {
      const pt = line.replace(/^[-*]\s/, '').trim()
      if (pt.length > 6) cards.push({ front: `What is "${lastHeading}"?`, back: pt })
    }
  }
  return cards.slice(0, 10)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { content, title } = req.body || {}
  if (!content || content.trim().length < 20) {
    return res.status(400).json({ error: 'Note content too short' })
  }

  const model = await getGemini()
  if (model) {
    try {
      const prompt = `Generate 5-10 flashcard Q&A pairs from these study notes. Focus on key concepts, definitions, formulas, and important facts.

Title: ${title || 'Study Notes'}
Notes:
${content.slice(0, 3000)}

Respond ONLY with a JSON array, no explanation:
[{"front": "question", "back": "answer"}, ...]`

      const result = await model.generateContent(prompt)
      const raw = result.response.text()
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        const cards = JSON.parse(match[0])
        if (Array.isArray(cards) && cards.length > 0) {
          return res.json({ cards: cards.slice(0, 12) })
        }
      }
    } catch (err) {
      console.error('Gemini flashcards error:', err.message)
    }
  }

  // Fallback: extract from markdown structure
  const cards = fallbackExtract(content)
  res.json({ cards })
}
