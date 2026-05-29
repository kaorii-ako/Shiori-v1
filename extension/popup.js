// Storage keys (mirror what the Shiori web app uses via localStorage)
const KEYS = {
  assignments: 'shiori-assignments',
  pomodoro: 'shiori-pomodoro',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get(key, (result) => {
      try {
        const raw = result[key]
        if (!raw) return resolve(null)
        resolve(JSON.parse(raw))
      } catch { resolve(null) }
    })
  })
}

function setStorage(key, value) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [key]: JSON.stringify(value) }, resolve)
  })
}

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const due = new Date(dateStr + 'T23:59:00')
  const now = new Date()
  return Math.ceil((due - now) / 86400000)
}

function showToast(msg) {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2000)
}

// ── Assignments ───────────────────────────────────────────────────────────────

const COLORS = ['#ff6b9d', '#c44dff', '#afc6ff', '#4dff91', '#ffd6a0']

async function loadAssignments() {
  const data = await getStorage(KEYS.assignments)
  const list = document.getElementById('assignmentList')

  // Try to read from the Shiori web app's localStorage via background message
  let assignments = data?.state?.assignments || []

  // Filter to pending/in-progress, sort by due date, take top 6
  const upcoming = assignments
    .filter(a => a.status !== 'completed' && a.status !== 'graded')
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    .slice(0, 6)

  if (!upcoming.length) {
    list.innerHTML = '<div class="empty">No upcoming assignments</div>'
    document.getElementById('statDone').textContent =
      assignments.filter(a => a.status === 'completed' || a.status === 'graded').length
    return
  }

  list.innerHTML = ''
  upcoming.forEach((a, i) => {
    const days = daysUntil(a.dueDate)
    const dueClass = days === 0 ? 'due-today' : days !== null && days <= 2 ? 'due-soon' : ''
    const dueText = days === null ? '' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`
    const color = a.color || COLORS[i % COLORS.length]

    const item = document.createElement('div')
    item.className = 'assignment-item'
    item.innerHTML = `
      <div class="assignment-dot" style="background:${color}"></div>
      <span class="assignment-title">${a.title}</span>
      ${dueText ? `<span class="assignment-due ${dueClass}">${dueText}</span>` : ''}
    `
    list.appendChild(item)
  })

  const done = assignments.filter(a => a.status === 'completed' || a.status === 'graded').length
  document.getElementById('statDone').textContent = done
}

// ── Quick Add ─────────────────────────────────────────────────────────────────

document.getElementById('addBtn').addEventListener('click', async () => {
  const title = document.getElementById('taskTitle').value.trim()
  if (!title) return

  const due = document.getElementById('taskDue').value
  const data = await getStorage(KEYS.assignments) || { state: { assignments: [], courses: [] } }
  const assignments = data.state?.assignments || []

  assignments.push({
    id: Date.now().toString(),
    title,
    dueDate: due || null,
    status: 'pending',
    priority: 'medium',
    source: 'extension',
    createdAt: new Date().toISOString(),
  })

  await setStorage(KEYS.assignments, { state: { ...data.state, assignments } })
  document.getElementById('taskTitle').value = ''
  document.getElementById('taskDue').value = ''
  showToast('Added to Shiori!')
  loadAssignments()
})

document.getElementById('taskTitle').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addBtn').click()
})

// ── Pomodoro (local to extension) ────────────────────────────────────────────

let pomoState = {
  isRunning: false,
  isBreak: false,
  secondsLeft: 25 * 60,
  workSeconds: 25 * 60,
  breakSeconds: 5 * 60,
  sessionCount: 0,
  totalFocusMinutes: 0,
}
let pomoInterval = null

function renderPomo() {
  document.getElementById('pomoTime').textContent = fmt(pomoState.secondsLeft)
  document.getElementById('pomoMode').textContent = pomoState.isBreak ? '☕ BREAK' : '🧠 FOCUS'
  document.getElementById('statSessions').textContent = pomoState.sessionCount
  document.getElementById('statFocus').textContent = `${pomoState.totalFocusMinutes}m`
  const btn = document.getElementById('pomoStart')
  btn.textContent = pomoState.isRunning ? '⏸' : '▶'
  btn.className = `pomo-btn ${pomoState.isRunning ? 'pomo-btn-pause' : 'pomo-btn-start'}`
}

function pomoTick() {
  if (pomoState.secondsLeft <= 1) {
    if (!pomoState.isBreak) {
      pomoState = {
        ...pomoState,
        isBreak: true,
        secondsLeft: pomoState.breakSeconds,
        sessionCount: pomoState.sessionCount + 1,
        totalFocusMinutes: pomoState.totalFocusMinutes + Math.round(pomoState.workSeconds / 60),
      }
      chrome.notifications?.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Focus session complete!',
        message: `Session #${pomoState.sessionCount} done. Time for a break! ☕`,
        priority: 1,
      })
    } else {
      pomoState = { ...pomoState, isBreak: false, secondsLeft: pomoState.workSeconds, isRunning: false }
      clearInterval(pomoInterval)
      pomoInterval = null
    }
  } else {
    pomoState.secondsLeft--
  }
  renderPomo()
}

document.getElementById('pomoStart').addEventListener('click', () => {
  if (pomoState.isRunning) {
    clearInterval(pomoInterval)
    pomoInterval = null
    pomoState.isRunning = false
  } else {
    pomoState.isRunning = true
    pomoInterval = setInterval(pomoTick, 1000)
  }
  renderPomo()
})

document.getElementById('pomoReset').addEventListener('click', () => {
  clearInterval(pomoInterval)
  pomoInterval = null
  pomoState = {
    ...pomoState,
    isRunning: false,
    secondsLeft: pomoState.isBreak ? pomoState.breakSeconds : pomoState.workSeconds,
  }
  renderPomo()
})

// ── Init ─────────────────────────────────────────────────────────────────────

renderPomo()
loadAssignments()

// Set today as default due date
const today = new Date().toISOString().split('T')[0]
document.getElementById('taskDue').value = today
