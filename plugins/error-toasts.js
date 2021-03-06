import Vue from 'vue'
import { APIError } from '@/api/BaseAPI'

const TOAST_EMAIL = 'support@ilovefreegle.org'
const TOAST_TITLE = 'Sorry, something went wrong'
const TOAST_MESSAGE = `
  That might be a bug, or perhaps your network connection broke.
  Please try again - if you continue to have problems then
  please take a screenshot and contact ${TOAST_EMAIL}
`

export default () => {
  const originalErrorHandler = Vue.config.errorHandler
  Vue.config.errorHandler = (err, vm, info, ...rest) => {
    if (err instanceof APIError && vm && vm.$bvToast) {
      const { request, response } = err
      console.error(err, { request, response })
      vm.$bvToast.toast(TOAST_MESSAGE, {
        title: TOAST_TITLE,
        variant: 'danger',
        toaster: 'b-toaster-bottom-center',
        autoHideDelay: 10000,
        appendToast: true,
        solid: true
      })
      return true
    }

    if (originalErrorHandler) {
      return originalErrorHandler(err, vm, info, ...rest)
    }
  }
}
