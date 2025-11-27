import { IconProps } from './types'

export default function ChevronLeftIcon({
  size = 21,
  color = '#191C20',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 15.5L8 10.5L13 5.5"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
