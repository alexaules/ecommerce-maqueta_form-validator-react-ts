export type FieldError = string | null

export const isNonEmpty = (v: string): FieldError =>
  v.trim().length ? null : 'Este campo es obligatorio.'

export const isEmail = (v: string): FieldError => {
  if (!v.trim()) return 'El correo es obligatorio.'
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  return ok ? null : 'Formato de correo no válido.'
}

export const passwordStrength = (v: string): { level: 'weak'|'medium'|'strong', score: number, error: FieldError } => {
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  if (v.length >= 12) score++

  let level: 'weak'|'medium'|'strong' = 'weak'
  if (score >= 4) level = 'strong'
  else if (score >= 2) level = 'medium'

  const error = v ? (score >= 2 ? null : 'Contraseña débil. Usa mayúsculas, números y símbolos.') : 'La contraseña es obligatoria.'
  return { level, score, error }
}

export const isSameAs = (other: string) => (v: string): FieldError =>
  v === other ? null : 'Las contraseñas no coinciden.'

export const isDate = (v: string): FieldError => {
  if (!v) return 'La fecha es obligatoria.'
  const d = new Date(v)
  return isNaN(d.getTime()) ? 'Fecha inválida.' : null
}

export const isAdult = (v: string, min = 18): FieldError => {
  const basic = isDate(v)
  if (basic) return basic
  const birth = new Date(v)
  const now = new Date()
  const age = now.getFullYear() - birth.getFullYear() - ((now.getMonth()<birth.getMonth() || (now.getMonth()==birth.getMonth() && now.getDate()<birth.getDate())) ? 1 : 0)
  return age >= min ? null : `Debes ser mayor de ${min} años.`
}

export const isNumber = (v: string): FieldError => {
  if (!v.trim()) return 'Este número es obligatorio.'
  return /^-?\d+(\.\d+)?$/.test(v) ? null : 'Debe ser un número válido.'
}

export const inRange = (min: number, max: number) => (v: string): FieldError => {
  const n = Number(v)
  if (Number.isNaN(n)) return 'Debe ser un número válido.'
  if (n < min || n > max) return `Debe estar entre ${min} y ${max}.`
  return null
}

export const optional = (validator: (v: string)=> FieldError) => (v: string): FieldError => {
  if (!v || !v.trim()) return null
  return validator(v)
}
