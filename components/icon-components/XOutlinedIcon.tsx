import { IconProps } from './types'

export default function XOutlinedIcon({
  size = 20,
  color = '#FF5A76',
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
        d="M12.4995 12.5L7.5 7.5M7.50053 12.5L12.5 7.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3332 9.99984C18.3332 5.39746 14.6022 1.6665 9.99984 1.6665C5.39746 1.6665 1.6665 5.39746 1.6665 9.99984C1.6665 14.6022 5.39746 18.3332 9.99984 18.3332C14.6022 18.3332 18.3332 14.6022 18.3332 9.99984Z"
        stroke={color}
      />
    </svg>
  )
}
