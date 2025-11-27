import { IconProps } from './types'

export default function CalendarIcon({
  height = 21,
  width = 20,
  color = '#191C20',
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 2.1665V3.83317M5 2.1665V3.83317"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99609 11.3335H10.0036M9.99609 14.6668H10.0036M13.3257 11.3335H13.3332M6.6665 11.3335H6.67398M6.6665 14.6668H6.67398"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.9165 7.1665H17.0832"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.0835 10.7027C2.0835 7.07162 2.0835 5.25607 3.12693 4.12803C4.17036 3 5.84974 3 9.2085 3H10.7918C14.1506 3 15.83 3 16.8734 4.12803C17.9168 5.25607 17.9168 7.07162 17.9168 10.7027V11.1307C17.9168 14.7617 17.9168 16.5773 16.8734 17.7053C15.83 18.8333 14.1506 18.8333 10.7918 18.8333H9.2085C5.84974 18.8333 4.17036 18.8333 3.12693 17.7053C2.0835 16.5773 2.0835 14.7617 2.0835 11.1307V10.7027Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 7.1665H17.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
