import { IconProps } from './types'

export default function SlidingIcon({
  width = 5,
  height = 16,
  color = '#9BA3AE',
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 5 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0.5" y1="2.34168e-08" x2="0.499999" y2="16" stroke={color} />
      <line x1="4.5" y1="2.34168e-08" x2="4.5" y2="16" stroke={color} />
    </svg>
  )
}
