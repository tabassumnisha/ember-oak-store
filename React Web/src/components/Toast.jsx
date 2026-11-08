import { useStore } from '../store'
import { Icon } from './Icons'

export default function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="toast" role="status" key={toast.id}>
      <Icon name="check" size={16} /> {toast.message}
    </div>
  )
}
