// Currency formatting utility
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_CODE = 'INR'
