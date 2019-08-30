// We want to force a login.
import Vue from 'vue'

export default Vue.mixin({
  mounted() {
    // We  do this check on the client side.  That's because we have trouble with whether the server is logged
    // in or not, and for our purposes we only really care about SSR for logged out pages, and therefore we don't need to
    // render the page correctly if they are in fact on the client.  So we can live with that.
    if (!process.server) {
      // Set up a watch on the store.  We do this because initially the store hasn't yet been reloaded from local
      // storage, so we don't know if we're logged in. When it does get loaded, this watch will fire.  So this way
      // we'll end up with the correct value of forceLogin set.
      this.$store.watch(
        (state, getters) => {
          const user = this.$store.getters['auth/user']()
          return user
        },
        (newValue, oldValue) => {
          if (!newValue) {
            this.$store.dispatch('auth/forceLogin', true)
          } else {
            this.$store.dispatch('auth/forceLogin', false)
          }
        }
      )
    }
  }
})