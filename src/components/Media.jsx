import { ProductArt } from '../art'

// Shows a real photo when `product.image` is set, otherwise the built-in illustration.
export default function Media({ product, color, view, className }) {
  if (product.image) {
    return <img className={className} src={product.image} alt={product.name} loading="lazy" />
  }
  return <ProductArt className={className} art={product.art} color={color} view={view} title={product.name} />
}
