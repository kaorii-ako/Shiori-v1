let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function playDing(type = 'focus') {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)

    if (type === 'break') {
      // Higher, cheerful double-ding for break start
      osc.frequency.setValueAtTime(880, ac.currentTime)
      osc.frequency.setValueAtTime(1046, ac.currentTime + 0.15)
    } else {
      // Lower warm tone for focus start
      osc.frequency.setValueAtTime(528, ac.currentTime)
      osc.frequency.setValueAtTime(440, ac.currentTime + 0.2)
    }

    gain.gain.setValueAtTime(0, ac.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ac.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.9)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + 0.9)
  } catch {}
}
