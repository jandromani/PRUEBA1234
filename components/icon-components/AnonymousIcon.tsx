import { IconProps } from './types'

export default function AnonymousIcon({
  size = 16,
  color = '#DC8F00',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.66666 10C3.56209 10 2.66666 10.8954 2.66666 12C2.66666 13.1045 3.56209 14 4.66666 14C5.77122 14 6.66666 13.1045 6.66666 12C6.66666 10.8954 5.77122 10 4.66666 10Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3333 10C10.2287 10 9.33334 10.8954 9.33334 12C9.33334 13.1045 10.2287 14 11.3333 14C12.4379 14 13.3333 13.1045 13.3333 12C13.3333 10.8954 12.4379 10 11.3333 10Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33332 11.3333H6.66666"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 8.66659C13.0289 7.84825 10.6489 7.33325 8.00001 7.33325C5.35106 7.33325 2.97107 7.84825 1.33334 8.66659"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6667 7.66668L11.9617 3.14163C11.8179 2.21879 10.8155 1.71875 10.0062 2.16613L9.59621 2.39277C8.60128 2.94275 7.39874 2.94275 6.40384 2.39277L5.99384 2.16613C5.18452 1.71875 4.18213 2.2188 4.03835 3.14163L3.33334 7.66668"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
