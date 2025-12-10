export enum UtilsPageName {
  PAGE_NOT_FOUND = "PageNotFound",
}

export type ButtonProps = {
  label: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  variant?: "primary" | "secondary"
  fluid?: boolean
}
