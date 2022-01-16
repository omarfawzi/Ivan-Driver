export function mobileValidator(email) {
  const re = /^(\+\d{1,3}[- ]?)?\d{11}$/
  if (!email) return "Mobile can't be empty."
  if (!re.test(email)) return 'Mobile is invalid.'
  return ''
}
