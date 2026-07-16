// A tiny hand-rolled confetti burst — a full library would be 30x the code
// for one moment of delight per day.

const COLORS = ['#d99a3d', '#e8b05c', '#f0c987', '#73736b', '#a3a39b']

export function fireConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:50'
  canvas.width = window.innerWidth * devicePixelRatio
  canvas.height = window.innerHeight * devicePixelRatio
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.scale(devicePixelRatio, devicePixelRatio)

  const cx = window.innerWidth / 2
  const cy = window.innerHeight * 0.35
  const particles = Array.from({ length: 120 }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 8
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      life: 1,
    }
  })

  const start = performance.now()
  function frame(now: number) {
    const elapsed = (now - start) / 1000
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.25 // gravity
      p.vx *= 0.99
      p.rotation += p.spin
      p.life = Math.max(0, 1 - elapsed / 1.6)
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (elapsed < 1.6) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
