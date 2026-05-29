// Background service worker for Shiori extension
// Handles alarms and cross-script messaging

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('check-assignments', { periodInMinutes: 60 })
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'IMPORT_ASSIGNMENTS') return false

  chrome.storage.local.get('shiori-assignments', async (result) => {
    try {
      const data = JSON.parse(result['shiori-assignments'] || 'null') || { state: { assignments: [], courses: [] } }
      const existing = data.state?.assignments || []
      const existingTitles = new Set(existing.map(a => a.title.toLowerCase()))

      const newItems = msg.assignments
        .filter(a => !existingTitles.has(a.title.toLowerCase()))
        .map(a => ({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          title: a.title,
          dueDate: a.due ? parseDue(a.due) : null,
          status: 'pending',
          priority: 'medium',
          source: 'google-classroom',
          createdAt: new Date().toISOString(),
        }))

      data.state.assignments = [...existing, ...newItems]
      await chrome.storage.local.set({ 'shiori-assignments': JSON.stringify(data) })
      sendResponse({ success: true, count: newItems.length })
    } catch (e) {
      sendResponse({ success: false })
    }
  })
  return true // keep channel open for async
})

function parseDue(str) {
  // Try to parse "Jan 15", "January 15, 2026", "15/01/2026" etc.
  try {
    const d = new Date(str)
    if (!isNaN(d)) return d.toISOString().split('T')[0]
  } catch {}
  return null
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'check-assignments') return

  const result = await chrome.storage.local.get('shiori-assignments')
  try {
    const data = JSON.parse(result['shiori-assignments'] || 'null')
    const assignments = data?.state?.assignments || []

    const soon = assignments.filter(a => {
      if (!a.dueDate || a.status === 'completed' || a.status === 'graded') return false
      const days = Math.ceil((new Date(a.dueDate + 'T23:59:00') - new Date()) / 86400000)
      return days === 1
    })

    if (soon.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: `${soon.length} assignment${soon.length > 1 ? 's' : ''} due tomorrow!`,
        message: soon.slice(0, 3).map(a => `• ${a.title}`).join('\n'),
        priority: 2,
      })
    }
  } catch {}
})
