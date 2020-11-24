export const formatDuration = (ms: number) => {
  if (ms < 0) ms = -ms
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000
  }
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ')
}

export function formatName(str: string | [], separator = '-') {
  const format = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .split(/[^0-9a-zA-Z]/)
      .filter(Boolean)
      .join(separator)
  return Array.isArray(str) ? str.filter(Boolean).map((t) => format(t)) : format(str)
}

// Example: HTMLInputElement => html-input-element
export function camelToKebab(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase()
}

export const capitalizeEveryWord = (str: string, separator = ''): string =>
  str
    .replace(/\b[a-z]/g, (char: string) => char.toUpperCase())
    .split(/[^0-9a-zA-Z]/)
    .filter(Boolean)
    .join(separator)
