import { CheckIcon } from '../icon-components'

export default function CustomCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center space-x-3">
      <div
        onClick={() => onChange(!checked)}
        className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer ${
          checked ? 'bg-primary' : 'border border-gray-300'
        }`}
      >
        {checked && <CheckIcon />}
      </div>
      <label
        htmlFor={id}
        className="text-primary font-medium cursor-pointer"
        onClick={() => onChange(!checked)}
      >
        {label}
      </label>
    </div>
  )
}
