const PATHS = {
  bag: 'M5 8h14l-1 12H6L5 8zm4 0V6a3 3 0 0 1 6 0v2',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-2 5 5',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c3-4 6-7 10-9',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-3 9 2.2 2.2L15 10',
  chevron: 'M6 9l6 6 6-6',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4',
  trash: 'M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c0-4 3.6-6 8-6s8 2 8 6',
  logout: 'M10 5H5v14h5M15 8l4 4-4 4M19 12H9',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0 9 5 9-5M12 13v8',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H3',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7-3 2-1-2-4-2 .5-1.5-1.2L15 4h-4l-.5 2.3L9 7.5 7 7 5 11l2 1v1l-2 1 2 4 2-.5 1.5 1.2L11 20h4l.5-2.3 1.5-1.2 2 .5 2-4-2-1v-1z',
}

export function Icon({ name, size = 20, stroke = 1.6, className, ...rest }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Stars({ value, size = 14 }) {
  const full = Math.round(value * 2) / 2
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <clipPath id={`half-${i}-${size}`}>
              <rect width="12" height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z"
            fill={full >= i ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {full >= i - 0.5 && full < i && (
            <path
              clipPath={`url(#half-${i}-${size})`}
              d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z"
              fill="currentColor"
            />
          )}
        </svg>
      ))}
    </span>
  )
}
