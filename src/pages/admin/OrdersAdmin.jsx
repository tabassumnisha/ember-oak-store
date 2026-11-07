import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { money } from '../../config'
import { fmtDate } from '../../utils'

export const STATUSES = ['Processing', 'Roasting', 'Shipped', 'Delivered', 'Cancelled']

function OrderDetail({ order, onClose }) {
  const { setOrderStatus } = useStore()
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={`Order ${order.id}`}>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head">
          <h2>Order {order.id}</h2>
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted">
          {fmtDate(order.createdAt)}, {order.payment}
        </p>
        <div className="two-col">
          <div>
            <h3>Customer</h3>
            <p>
              {order.customer.name}
              <br />
              {order.customer.email}
              <br />
              {order.customer.address ? `${order.customer.address}, ` : ''}
              {order.customer.city}
            </p>
          </div>
          <div>
            <label className="field">
              <span>Status</span>
              <select value={order.status} onChange={(e) => setOrderStatus(order.id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <ul className="sum-lines">
          {order.items.map((i, n) => (
            <li key={n}>
              <div>
                <strong>
                  {i.qty} × {i.name}
                </strong>
                <small>{[i.size, i.grind].filter(Boolean).join(', ')}</small>
              </div>
              <span>{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>{money(order.shipping)}</dd></div>
          <div><dt>Tax</dt><dd>{money(order.tax)}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
      </div>
    </div>
  )
}

export default function OrdersAdmin() {
  const { orders, setOrderStatus } = useStore()
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const list = useMemo(() => orders.filter((o) => filter === 'all' || o.status === filter), [orders, filter])
  const open = orders.find((o) => o.id === openId)

  return (
    <>
      <div className="admin-bar">
        <h1 className="admin-h">Orders</h1>
        <label className="sort">
          <span className="sr">Filter by status</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>
                  <button className="link-btn strong" onClick={() => setOpenId(o.id)}>
                    {o.id}
                  </button>
                </td>
                <td>{fmtDate(o.createdAt)}</td>
                <td>{o.customer.name}</td>
                <td>{money(o.total)}</td>
                <td>
                  <select className={`status s-${o.status.toLowerCase()}`} value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} aria-label={`Status of ${o.id}`}>
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="muted pad">No orders with this status.</p>}
      </div>
      {open && <OrderDetail order={open} onClose={() => setOpenId(null)} />}
    </>
  )
}
