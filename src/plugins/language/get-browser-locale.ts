export const getBrowserLocale = (supported: string[], fallback = "en"): string => {
  const locale = navigator.language.split("-")[0]
  return supported.includes(locale) ? locale : fallback
}
