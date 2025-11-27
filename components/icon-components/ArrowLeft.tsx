import { IconProps } from './types'

export default function ArrowLeft({ size = 20, color = '#3C424B' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.33325 9.99985H16.6666"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49965 14.1667C7.49965 14.1667 3.33302 11.098 3.33301 10C3.333 8.90201 7.49967 5.83334 7.49967 5.83334"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
