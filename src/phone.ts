export const hasPhoneCharacters = (value: string) => /^\+?[0-9 ]*$/.test(value)

export function isValidPhone(value: string) {
  const phone = value.trim()
  const digitCount = phone.replace(/\D/g, '').length
  return hasPhoneCharacters(phone) && digitCount >= 7 && digitCount <= 15
}
