import { useState } from 'react'

// Original SVG product illustrations. Each product's `art` object picks a drawing and colours.
// Replace these with real photos by setting `image` on a product (see ProductCard / ProductPage).

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
function parse(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')
export const tint = (hex, t) => {
  const [r, g, b] = parse(hex)
  return toHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t)
}
export const shade = (hex, t) => {
  const [r, g, b] = parse(hex)
  return toHex(r * (1 - t), g * (1 - t), b * (1 - t))
}
const luminance = (hex) => {
  const [r, g, b] = parse(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const PAPER = '#EEF0E8'
const INK = '#141714'

function Shadow({ cx = 200, cy = 350, rx = 95 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="10" fill="#000" opacity="0.14" />
}

function Bag({ color, label, sub, ink }) {
  const dark = luminance(color) < 0.55
  const text = ink || (dark ? PAPER : INK)
  const words = (label || '').split(' ')
  const lines = words.length > 1 && label.length > 11 ? [words[0], words.slice(1).join(' ')] : [label]
  return (
    <g>
      <Shadow cy={352} rx={100} />
      <path d="M108 112 H292 V332 Q292 344 280 344 H120 Q108 344 108 332 Z" fill={color} />
      <path d="M270 112 H292 V332 Q292 344 280 344 H270 Z" fill={shade(color, 0.14)} />
      <path d="M108 112 H292 V150 H108 Z" fill={shade(color, 0.1)} />
      <path d="M108 150 H292" stroke={shade(color, 0.28)} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <rect x="108" y="84" width="184" height="30" rx="4" fill={shade(color, 0.22)} />
      <rect x="108" y="84" width="184" height="9" rx="4" fill={shade(color, 0.32)} />
      <rect x="136" y="178" width="128" height="128" rx="6" fill={PAPER} />
      <circle cx="200" cy="204" r="9" fill={color} />
      <path d="M200 197 q6 6 0 14 q-6 -8 0 -14z" fill={PAPER} />
      {lines.map((ln, i) => (
        <text key={i} x="200" y={236 + i * 20} textAnchor="middle" fontSize={ln.length > 10 ? 17 : 20} fontWeight="900" fill={INK} fontFamily="Inter, system-ui, sans-serif" letterSpacing="-0.4">
          {ln}
        </text>
      ))}
      <text x="200" y={236 + lines.length * 20 + 2} textAnchor="middle" fontSize="12" fontWeight="600" fill={color === '#F2B01E' || color === '#E88FA3' ? INK : shade(color, 0.1)} fontFamily="Inter, system-ui, sans-serif">
        {sub}
      </text>
      <rect x="168" y="290" width="64" height="10" rx="5" fill={tint(color, 0.8)} />
      <text x="200" y="298.4" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={shade(color, 0.3)} fontFamily="Inter, system-ui, sans-serif">
        WHOLE BEAN
      </text>
      <path d="M112 126 q-4 90 0 200" stroke={text} strokeWidth="0" fill="none" />
    </g>
  )
}

function Dripper({ color }) {
  return (
    <g>
      <Shadow cy={352} rx={105} />
      <rect x="120" y="258" width="150" height="88" rx="14" fill={PAPER} stroke="#D9D5CA" strokeWidth="2" />
      <path d="M270 276 h18 a18 18 0 0 1 0 44 h-18" fill="none" stroke="#D9D5CA" strokeWidth="12" strokeLinecap="round" />
      <path d="M270 276 h18 a18 18 0 0 1 0 44 h-18" fill="none" stroke={PAPER} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="195" cy="262" rx="62" ry="9" fill="#4A2F22" />
      <path d="M106 150 H284 L232 262 H158 Z" fill={color} />
      <path d="M106 150 H150 L168 262 H158 Z" fill="#fff" opacity="0.16" />
      <rect x="96" y="136" width="198" height="20" rx="10" fill={shade(color, 0.12)} />
      <rect x="96" y="136" width="198" height="7" rx="3.5" fill="#fff" opacity="0.25" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${130 + i * 32} 160 L${170 + i * 14} 254`} stroke={shade(color, 0.22)} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      ))}
      <circle cx="195" cy="232" r="4" fill="#4A2F22" />
      <path d="M195 244 v8" stroke="#4A2F22" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function Kettle({ color }) {
  return (
    <g>
      <Shadow cy={350} rx={105} />
      <path d="M100 340 Q96 250 130 214 H250 Q284 250 280 340 Z" fill={color} />
      <path d="M100 340 Q96 250 130 214 H150 Q126 262 130 340 Z" fill="#fff" opacity="0.18" />
      <path d="M262 340 Q280 290 268 236 L250 214 Q284 250 280 340 Z" fill="#000" opacity="0.14" />
      <rect x="122" y="196" width="136" height="22" rx="8" fill={shade(color, 0.18)} />
      <rect x="168" y="178" width="44" height="22" rx="10" fill={shade(color, 0.3)} />
      <circle cx="190" cy="172" r="9" fill="#2B2B33" />
      <path d="M270 300 C318 300 332 190 342 140 L330 124 C322 150 318 232 268 262" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <path d="M130 250 C70 250 78 330 130 322" fill="none" stroke="#2B2B33" strokeWidth="16" strokeLinecap="round" />
      <rect x="112" y="338" width="156" height="12" rx="6" fill="#2B2B33" />
    </g>
  )
}

function Grinder({ color }) {
  return (
    <g>
      <Shadow cy={352} rx={90} />
      <path d="M142 232 H258 L252 342 Q252 350 244 350 H156 Q148 350 148 342 Z" fill="#fff" opacity="0.55" stroke="#CFCBBF" strokeWidth="2" />
      <path d="M150 300 H250 L248 342 Q248 346 244 346 H156 Q152 346 152 342 Z" fill="#6B4130" />
      <path d="M150 300 q25 -10 50 0 t50 0 V306 H150z" fill="#6B4130" />
      <rect x="138" y="122" width="124" height="116" rx="12" fill={color} />
      <rect x="138" y="122" width="26" height="116" rx="12" fill="#fff" opacity="0.2" />
      <rect x="138" y="204" width="124" height="8" fill={shade(color, 0.25)} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={150 + i * 13} y="150" width="3" height="40" rx="1.5" fill={shade(color, 0.22)} />
      ))}
      <rect x="170" y="100" width="60" height="26" rx="8" fill="#2B2B33" />
      <rect x="196" y="70" width="8" height="34" fill="#2B2B33" />
      <path d="M200 76 H316" stroke="#2B2B33" strokeWidth="11" strokeLinecap="round" />
      <circle cx="322" cy="76" r="16" fill="#D9A36B" />
      <circle cx="322" cy="76" r="16" fill="none" stroke="#B9824D" strokeWidth="3" />
    </g>
  )
}

function Scale({ color }) {
  return (
    <g>
      <Shadow cy={338} rx={120} />
      <path d="M86 262 L106 218 H294 L314 262 V316 Q314 330 300 330 H100 Q86 330 86 316 Z" fill={color} />
      <path d="M86 262 H314 V272 H86 Z" fill="#000" opacity="0.18" />
      <path d="M106 218 H294 L314 262 H86 Z" fill={tint(color, 0.18)} />
      <rect x="100" y="228" width="200" height="26" rx="6" fill="#fff" opacity="0.2" />
      <rect x="146" y="280" width="108" height="34" rx="6" fill="#16221A" />
      <text x="200" y="305" textAnchor="middle" fontSize="23" fontWeight="700" fill="#8CF2B1" fontFamily="Inter, system-ui, sans-serif">
        18.0 g
      </text>
      <circle cx="116" cy="297" r="9" fill={shade(color, 0.3)} />
      <circle cx="284" cy="297" r="9" fill={shade(color, 0.3)} />
      <rect x="132" y="156" width="136" height="14" rx="7" fill="#2B2B33" opacity="0.0" />
    </g>
  )
}

function Mug({ color }) {
  const glaze = shade(color, 0.12)
  return (
    <g>
      <Shadow cy={346} rx={100} />
      <path d="M262 188 h26 a38 38 0 0 1 0 82 h-26" fill="none" stroke={glaze} strokeWidth="20" strokeLinecap="round" />
      <path d="M118 150 H268 V300 Q268 342 226 342 H160 Q118 342 118 300 Z" fill={color} />
      <path d="M118 150 H146 V342 H160 Q118 342 118 300 Z" fill="#fff" opacity="0.22" />
      <ellipse cx="193" cy="150" rx="75" ry="16" fill={shade(color, 0.2)} />
      <ellipse cx="193" cy="152" rx="66" ry="11" fill="#3D2418" />
      {[
        [150, 210], [176, 246], [214, 222], [236, 276], [162, 292], [200, 300], [232, 190],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill={shade(color, 0.45)} opacity="0.55" />
      ))}
    </g>
  )
}

function Tumbler({ color }) {
  return (
    <g>
      <Shadow cy={350} rx={78} />
      <rect x="146" y="70" width="108" height="30" rx="10" fill="#2B2B33" />
      <rect x="156" y="52" width="88" height="24" rx="10" fill="#2B2B33" />
      <rect x="196" y="60" width="26" height="6" rx="3" fill="#4B4B55" />
      <path d="M140 100 H260 L246 336 Q245 348 233 348 H167 Q155 348 154 336 Z" fill={color} />
      <path d="M140 100 H162 L170 348 H167 Q155 348 154 336 Z" fill="#fff" opacity="0.22" />
      <rect x="140" y="100" width="120" height="14" rx="4" fill={shade(color, 0.18)} />
      <rect x="170" y="190" width="60" height="64" rx="6" fill={tint(color, 0.8)} opacity="0.9" />
      <path d="M186 232 q14 -22 28 0 q-14 10 -28 0z" fill={shade(color, 0.2)} />
    </g>
  )
}

function Giftbox({ color, accent }) {
  const ribbon = accent || '#F2B01E'
  return (
    <g>
      <Shadow cy={346} rx={125} />
      <rect x="86" y="170" width="228" height="170" rx="6" fill={color} />
      <rect x="86" y="170" width="228" height="170" rx="6" fill="#fff" opacity="0.08" />
      <rect x="286" y="170" width="28" height="170" fill="#000" opacity="0.12" />
      <rect x="74" y="136" width="252" height="48" rx="6" fill={shade(color, 0.14)} />
      <rect x="74" y="136" width="252" height="12" rx="6" fill="#fff" opacity="0.18" />
      <rect x="180" y="136" width="40" height="204" fill={ribbon} />
      <path d="M200 136 C150 84 108 96 128 126 C140 142 180 138 200 136z" fill={ribbon} />
      <path d="M200 136 C250 84 292 96 272 126 C260 142 220 138 200 136z" fill={ribbon} />
      <path d="M200 136 C150 84 108 96 128 126" fill="none" stroke="#000" strokeWidth="2" opacity="0.12" />
      <path d="M200 136 C250 84 292 96 272 126" fill="none" stroke="#000" strokeWidth="2" opacity="0.12" />
      <circle cx="200" cy="136" r="13" fill={shade(ribbon, 0.12)} />
    </g>
  )
}

const DRAWINGS = { bag: Bag, dripper: Dripper, kettle: Kettle, grinder: Grinder, scale: Scale, mug: Mug, tumbler: Tumbler, giftbox: Giftbox }

let uid = 0
export function ProductArt({ art, color, view = 'main', className = '', title }) {
  const Drawing = DRAWINGS[art.type] || Bag
  const base = color || art.color
  const props = { ...art, color: base }
  const [id] = useState(() => `pa${++uid}`)
  const light = view === 'light'
  const transform = view === 'close' ? 'translate(-130 -120) scale(1.65)' : undefined
  return (
    <svg className={className} viewBox="0 0 400 400" role="img" aria-label={title || 'Product illustration'} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          {light ? (
            <>
              <stop offset="0" stopColor="#E9ECE1" />
              <stop offset="1" stopColor="#D5DACB" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#1B3A32" />
              <stop offset="1" stopColor="#0F1F1A" />
            </>
          )}
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.38" r="0.6">
          <stop offset="0" stopColor="#B9975B" stopOpacity={light ? 0.18 : 0.32} />
          <stop offset="1" stopColor="#B9975B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}-bg)`} />
      <rect width="400" height="400" fill={`url(#${id}-glow)`} />
      <rect y="352" width="400" height="48" fill="#000" opacity={light ? 0.05 : 0.18} />
      <g transform={transform}>
        <Drawing {...props} />
      </g>
    </svg>
  )
}
