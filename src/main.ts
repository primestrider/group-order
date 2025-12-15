import { createPinia } from "pinia"
import { createApp } from "vue"

import App from "./App.vue"
import "./assets/main.css"
import { ensureAnonymousAuth } from "./plugins/firebase/auth"
import { i18n } from "./plugins/language"
import { installVueQuery } from "./plugins/tanstack"
import { setupVeeValidate } from "./plugins/vee-validate"
import router from "./router"

async function bootstrap() {
  try {
    await ensureAnonymousAuth()
  } catch (error) {
    console.error("Anonymous auth failed:", error)
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(i18n)

  installVueQuery(app)
  setupVeeValidate(app)

  app.mount("#app")
}

await bootstrap()
