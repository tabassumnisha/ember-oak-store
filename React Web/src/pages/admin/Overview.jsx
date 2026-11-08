import { useMemo } from 'react'
import { Link } from '../../router'
import { useStore } from '../../store'
import { money } from '../../config'
import { fmtDay } from '../../utils'

function SalesChart({ days }) {
  const max = Math.max(...days.map((d) => d.total), 1)
  const W = 640
  const H = 220
  const pad = { l: 44, r: 8, t: 12, b: 28 }
  const bw = (W - pad.l - pad.r) / days.length
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t))
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue per day for the last 14 days">
      {ticks.map((t, ti) => {
        const y = pad.t + (H - pad.t - pad.b) * (1 - t / max)
        return (
          <g key={ti}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} className="grid-line" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="axis">
              ${t}
            </text>
          </g>
        )
      })}
      {days.map((d, i) => {
        const h = (H - pad.t - pad.b) * (d.total / max)
        const x = pad.l + i * bw + bw * 0.18
        return (
          <g key={d.key}>
            <rect x={x} y={H - pad.b - h} width={bw * 0.64} height={Math.max(h, 0)} rx="1.5" className="bar-rect">
              <title>{`${fmtDay(d.key)}: ${money(d.total)}`}</title>
            </rect>
            {i % 2 === 0 && (
              <text x={x + bw * 0.32} y={H - 8} textAnchor="middle" className="axis">
                {fmtDay(d.key)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function Overview() {
  const { orders, products } = useStore()

  const data = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'Cancelled')
    const revenue = live.reduce((s, o) => s + o.total, 0)
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      days.push({ key, total: 0 })
    }
    live.forEach((o) => {
      const slot = days.find((d) => d.key === o.createdAt.slice(0, 10))
      if (slot) slot.total += o.total
    })
    const sold = {}
    live.forEach((o) => o.items.forEach((i) => (sold[i.productId] = (sold[i.productId] || 0) + i.qty)))
    const top = Object.entries(sold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
      .filter((t) => t.product)
    return {
      revenue,
      count: live.length,
      aov: live.length ? revenue / live.length : 0,
      days,
      top,
      low: products.filter((p) => p.stock <= 20).sort((a, b) => a.stock - b.stock),
    }
  }, [orders, products])

  return (
    <>
      <h1 className="admin-h">Overview</h1>
      <div className="stats">
        <div className="stat"><span>Revenue</span><strong>{money(data.revenue)}</strong></div>
        <div className="stat"><span>Orders</span><strong>{data.count}</strong></div>
        <div className="stat"><span>Average order</span><strong>{money(data.aov)}</strong></div>
        <div className="stat"><span>Low stock</span><strong>{data.low.length}</strong></div>
      </div>

      <div className="panel">
        <h2>Revenue, last 14 days</h2>
        <SalesChart days={data.days} />
      </div>

      <div className="two-col">
        <div className="panel">
          <h2>Best sellers</h2>
          <ol className="rank">
            {data.top.map((t) => (
              <li key={t.product.id}>
                <Link to={`/product/${t.product.id}`}>{t.product.name}</Link>
                <span>{t.qty} sold</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel">
          <h2>Needs restocking</h2>
          {data.low.length === 0 ? (
            <p className="muted">Every product has healthy stock.</p>
          ) : (
            <ul className="rank">
              {data.low.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link to="/admin/products">{p.name}</Link>
                  <span className={p.stock === 0 ? 'out' : ''}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
