const pad = (n) => String(n).padStart(2, '0')

const toISOBasic = (date) => {
  const d = new Date(date)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

const escapeICS = (str) => String(str || '').replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n')

export const exportAssignmentsToICal = (assignments) => {
  const now = toISOBasic(new Date())
  const pending = assignments.filter(a => a.dueDate && a.status !== 'graded')

  const events = pending.map(a => {
    const due = new Date(a.dueDate)
    due.setHours(23, 59, 0, 0)
    const dtstart = toISOBasic(due)

    return [
      'BEGIN:VEVENT',
      `UID:shiori-${a.id}@shiori-app`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtstart}`,
      `SUMMARY:${escapeICS(a.title)}`,
      `DESCRIPTION:${escapeICS(`${a.courseName || ''} — ${a.description || ''}`)}`,
      `CATEGORIES:${escapeICS(a.priority?.toUpperCase() || 'TASK')}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shiori//AI Study Companion//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Shiori Deadlines',
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shiori-deadlines-${new Date().toISOString().split('T')[0]}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
