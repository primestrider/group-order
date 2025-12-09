// src/plugins/vee-validate.ts
import {
  ErrorMessage as VErrorMessage,
  Field as VField,
  Form as VForm,
  configure,
} from "vee-validate"
import type { App, Plugin } from "vue"

import { i18n } from "@/plugins/language"

function configureVeeValidate() {
  configure({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: false,
    validateOnModelUpdate: true,
    bails: true,
    generateMessage: (context) => {
      const field = context.field || "field"
      const t = i18n?.global?.t

      if (!t) {
        return `The ${field} field is invalid.`
      }

      return t("utils.validation.default", { field })
    },
  })
}

export const veeValidatePlugin: Plugin = {
  install(app: App) {
    app.component("VForm", VForm)
    app.component("VField", VField)
    app.component("VErrorMessage", VErrorMessage)
    configureVeeValidate()
  },
}

export function setupVeeValidate(app: App) {
  app.use(veeValidatePlugin)
}
