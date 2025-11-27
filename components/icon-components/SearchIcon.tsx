import { IconProps } from './types'

export default function SearchIcon({
  size = 20,
  color = '#657080',
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
        d="M14.5833 14.5833L18.3333 18.3333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 9.16669C16.6667 5.02455 13.3089 1.66669 9.16675 1.66669C5.02461 1.66669 1.66675 5.02455 1.66675 9.16669C1.66675 13.3089 5.02461 16.6667 9.16675 16.6667C13.3089 16.6667 16.6667 13.3089 16.6667 9.16669Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
