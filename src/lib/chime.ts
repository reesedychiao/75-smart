/** Two soft sine tones (C5 then G5) — enough to notice, gentle enough not to
 * jolt you out of the state the timer just helped you build. */
export function playChime() {
  const ctx = new AudioContext()
  const notes = [523.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t = ctx.currentTime + i * 0.18
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)
    osc.start(t)
    osc.stop(t + 1.3)
  })
}
