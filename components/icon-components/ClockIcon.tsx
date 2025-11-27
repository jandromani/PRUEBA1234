import { IconProps } from './types'

export default function ClockIcon({
  height = 21,
  width = 20,
  color = '#9BA3AE',
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4998 5.00008V10.0001L13.8332 11.6667M18.8332 10.0001C18.8332 14.6025 15.1022 18.3334 10.4998 18.3334C5.89746 18.3334 2.1665 14.6025 2.1665 10.0001C2.1665 5.39771 5.89746 1.66675 10.4998 1.66675C15.1022 1.66675 18.8332 5.39771 18.8332 10.0001Z"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
