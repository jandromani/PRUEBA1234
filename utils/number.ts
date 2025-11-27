export const formatFloat = (num: number, maxDecimals: number = 2) => {
  if (num === 0) return '0'
  if (isNaN(num)) return ''

  const isInt = num % 1 === 0
  const calcMaxDecimals = isInt ? 0 : maxDecimals

  return num.toLocaleString('en-US', {
    maximumFractionDigits: calcMaxDecimals,
    minimumFractionDigits: calcMaxDecimals,
  })
}
