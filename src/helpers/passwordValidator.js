export function passwordValidator(password) {
  if (!password) return 'من فضلك ادخل كلمة السر'
  if (password.length < 5) return 'كلمة السر يجب ان تكون اكثر من ٤ حروف'
  return ''
}
