export function mobileValidator(email) {
  const re = /^(\+\d{1,3}[- ]?)?\d{11}$/
  if (!email) return 'من فضلك ادخل رقم الموبايل'
  if (!re.test(email)) return 'رقم الموبايل غير صحيح'
  return ''
}
