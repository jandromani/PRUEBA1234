import { IconProps } from './types'

export default function MoreVertical({
  size = 20,
  color = '#191C20',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99316 10H10.0007"
        stroke={color}
        strokeWidth="2.08333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.98682 15H9.99432"
        stroke={color}
        strokeWidth="2.08333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5H10.0075"
        stroke={color}
        strokeWidth="2.08333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
