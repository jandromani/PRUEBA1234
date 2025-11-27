import { IconProps } from './types'

export default function SlidersHorizontal({
  size = 20,
  color = 'white',
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
        d="M2.5 5.83331H5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 14.1667H7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 14.1667H17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 5.83331H17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5.83331C5 5.05675 5 4.66846 5.12687 4.36217C5.29602 3.9538 5.62048 3.62934 6.02886 3.46018C6.33515 3.33331 6.72343 3.33331 7.5 3.33331C8.27657 3.33331 8.66483 3.33331 8.97117 3.46018C9.3795 3.62934 9.704 3.9538 9.87317 4.36217C10 4.66846 10 5.05675 10 5.83331C10 6.60988 10 6.99816 9.87317 7.30445C9.704 7.71283 9.3795 8.03729 8.97117 8.20645C8.66483 8.33331 8.27657 8.33331 7.5 8.33331C6.72343 8.33331 6.33515 8.33331 6.02886 8.20645C5.62048 8.03729 5.29602 7.71283 5.12687 7.30445C5 6.99816 5 6.60988 5 5.83331Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M10 14.1667C10 13.3901 10 13.0019 10.1268 12.6955C10.296 12.2872 10.6205 11.9627 11.0288 11.7935C11.3352 11.6667 11.7234 11.6667 12.5 11.6667C13.2766 11.6667 13.6648 11.6667 13.9712 11.7935C14.3795 11.9627 14.704 12.2872 14.8732 12.6955C15 13.0019 15 13.3901 15 14.1667C15 14.9433 15 15.3315 14.8732 15.6379C14.704 16.0462 14.3795 16.3707 13.9712 16.5399C13.6648 16.6667 13.2766 16.6667 12.5 16.6667C11.7234 16.6667 11.3352 16.6667 11.0288 16.5399C10.6205 16.3707 10.296 16.0462 10.1268 15.6379C10 15.3315 10 14.9433 10 14.1667Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  )
}
