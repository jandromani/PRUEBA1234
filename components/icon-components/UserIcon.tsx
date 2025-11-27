import { IconProps } from './types'

export default function UserIcon({ size = 20, color = '#657080' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.48131 12.9013C4.30234 13.6033 1.21114 15.0367 3.09389 16.8305C4.01359 17.7066 5.03791 18.3333 6.32573 18.3333H13.6743C14.9621 18.3333 15.9864 17.7066 16.9061 16.8305C18.7888 15.0367 15.6977 13.6033 14.5187 12.9013C11.754 11.2551 8.24599 11.2551 5.48131 12.9013Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 5.41669C13.75 7.48775 12.0711 9.16669 10 9.16669C7.92893 9.16669 6.25 7.48775 6.25 5.41669C6.25 3.34562 7.92893 1.66669 10 1.66669C12.0711 1.66669 13.75 3.34562 13.75 5.41669Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  )
}
