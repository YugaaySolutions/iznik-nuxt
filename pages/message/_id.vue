<template>
  <b-col>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
        <div v-if="error">
          <h1>Sorry, that message isn't around any more.</h1>
          <div class="bg-white">
            <p>If it was an OFFER, it's probably been TAKEN. If it was a WANTED, it's probably been RECEIVED.</p>
            <p>Why not look for something else?</p>
          </div>
          <b-row>
            <b-col cols="5" class="mt-1">
              <b-button to="/give" class="mt-1" size="lg" block variant="success">
                <v-icon name="gift" />&nbsp;Give stuff
              </b-button>
            </b-col>
            <b-col cols="2" />
            <b-col cols="5">
              <b-button to="/find" class="mt-1" size="lg" block variant="primary">
                <v-icon name="search" />&nbsp;Find stuff
              </b-button>
            </b-col>
          </b-row>
        </div>
        <div v-else>
          <message v-if="message" ref="message" v-bind="message" :start-expanded="true" />
        </div>
      </b-col>
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
  </b-col>
</template>
<style scoped>
</style>
<script>
import loginOptional from '@/mixins/loginOptional.js'
import buildHead from '@/mixins/buildHead.js'
import twem from '~/assets/js/twem'

const Message = () => import('~/components/Message.vue')

export default {
  components: {
    Message
  },
  mixins: [loginOptional, buildHead],
  data: function() {
    return {
      id: null,
      message: null
    }
  },
  computed: {},
  watch: {
    options(newVal, oldVal) {
      if (this.filterByAnchor) {
        const { type, anchor } = this
        const regex = new RegExp(`${type}`, 'i')
        const filtered = newVal.filter(item => {
          const found = item[anchor].search(regex) !== -1
          return found
        })
        this.json = filtered
      } else {
        this.json = newVal
      }
    }
  },
  async asyncData({ app, params, store }) {
    try {
      await store.dispatch('messages/fetch', {
        id: params.id
      })

      const message = store.getters['messages/get'](params.id)

      return {
        message: message,
        error: false
      }
    } catch (e) {
      return {
        message: null,
        error: true
      }
    }
  },
  created() {
    this.id = this.$route.params.id
  },
  head() {
    let snip = null
    const message = this.message

    if (message) {
      if (message.snippet) {
        snip = twem.twem(this.$emoji, message.snippet)
      } else {
        snip = 'Click for more details'
      }

      return this.buildHead(
        message.subject,
        snip,
        message.attachments && message.attachments.length > 1
          ? message.attachments[0].path
          : null
      )
    }
  },
  mounted() {
    if (process.browser && this.message && !this.message.fromuser) {
      // We are on the client and loading a page which we have rendered on the server rather than navigated to on the
      // client side.  We will therefore have rendered it logged out.  Refetch the message so that we get more info,
      // which we may do when logged in.
      this.$store.dispatch('messages/fetch', {
        id: this.id
      })
    }
  }
}
</script>
