<template>
  <div>
    <b-row class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <h1 class="text-center">
          Ok, what are you looking for?
        </h1>
        <b-row>
          <b-col class="text-muted pl-0 pt-1 text-center">
            We'll search so that you can see if someone has already posted an OFFER. If not, you can post a WANTED for it.
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center">
            <b-form-radio-group
              v-model="searchtype"
              :options="options"
              name="radio-inline"
              class="mt-2 mb-2"
              @change="changetype"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div class="text-center">
              <autocomplete
                ref="autocomplete"
                v-model="term"
                :url="source"
                param="typeahead"
                anchor="name"
                label=""
                :classes="{ input: 'form-control form-control-lg', list: 'iteminp' }"
                :min="2"
                :debounce="100"
                :process="process"
                size="60"
                maxlength="60"
                spellcheck="true"
                placeholder="e.g. sofa, bike, desk..."
                searchbutton="true"
                :on-select="select"
                @search="search"
              />
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center mt-2 mb-2">
            <em>Or</em>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center">
            <nuxt-link to="/find/whatisit">
              <b-btn v-if="!term || !term.length" variant="white" size="lg">
                Post a WANTED
              </b-btn>
              <b-btn v-else variant="primary" size="lg">
                Post a WANTED
              </b-btn>
            </nuxt-link>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center mt-3">
            <h2 v-if="!term || !term.length">
              Or just browse...
            </h2>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div v-for="message in filteredMessages" :key="'message-' + message.id" class="p-0">
              <message v-if="message.type == searchtype" v-bind="message" />
            </div>

            <client-only>
              <infinite-loading :key="searchtype" :distance="distance" @infinite="loadMore">
                <span slot="no-results" />
                <span slot="no-more" />
                <span slot="spinner">
                  <span slot="no-results" />
                  <b-img-lazy src="~/static/loader.gif" alt="Loading" />
                </span>
              </infinite-loading>
            </client-only>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </div>
</template>

<style scoped lang="scss">
@import 'color-vars';

.form-group {
  border: 1px $color-gray--dark solid;
  border-radius: 0.2rem;
}
</style>

<script>
// TODO RAHUL DESIGN Maybe some kind of border round the search options.
// TODO RAHUL DESIGN When you focus on the search box, there's a drop shadow to highlight it, but that only goes round
//      the input, and not also round the button, which it should.
import InfiniteLoading from 'vue-infinite-loading'
import Autocomplete from '~/components/Autocomplete'
import loginOptional from '@/mixins/loginOptional.js'
import buildHead from '@/mixins/buildHead.js'
const Message = () => import('~/components/Message.vue')

export default {
  components: {
    InfiniteLoading,
    Autocomplete,
    Message
  },
  mixins: [loginOptional, buildHead],
  data: function() {
    return {
      options: [
        { text: 'Search OFFERs', value: 'Offer' },
        { text: 'Search WANTEDs', value: 'Wanted' }
      ],
      searchtype: 'Offer',
      source: process.env.API + '/item',
      context: null,
      complete: false,
      distance: 1000
    }
  },
  computed: {
    messages() {
      let messages

      if (this.group) {
        messages = this.$store.getters['messages/getByGroup'](this.group.id)
      } else {
        messages = this.$store.getters['messages/getAll']
      }

      return messages
    },
    filteredMessages() {
      return this.messages.filter(message => {
        return !message.outcomes || message.outcomes.length === 0
      })
    }
  },
  asyncData({ app, params, store }) {
    // Get any value passed in the url for what to search for
    let term = params.term
    term = term && term !== 'null' ? term : null

    return {
      term: term
    }
  },
  mounted() {
    this.$refs.autocomplete.setValue(this.term)

    // Ensure we have no cached messages for other searches/groups
    this.$store.dispatch('messages/clear')

    // Focus on field to grab their attention.
    this.$refs.autocomplete.$refs.input.focus()

    // Components can't use asyncData, so we fetch here.  Can't do this for SSR, but that's fine as we don't
    // need to render this on the server.
    this.$nextTick(this.search)

    // We need some fettling of the input keystrokes.
    const input = this.$refs.autocomplete.$refs.input
    input.addEventListener('keydown', this.keydown, false)
  },
  // async asyncData({ app, params, store }) {
  //   this.loadMessages()
  // },
  methods: {
    keydown(e) {
      if (e.which === 8) {
        // Backspace means we no longer have a full item.  Parent might want to know that we don't have a valid
        // item any more.
        this.$emit('cleared')
        this.results = null
      }

      if (this.$refs.autocomplete && this.$refs.autocomplete.$refs) {
        // We've seen this not be defined - perhaps during navigation when we're destroying this component?
        // If the ref isn't present then it doesn't make sense to emit the event.
        const input = this.$refs.autocomplete.$refs.input
        this.$emit('typed', input.value)
      }
    },
    process(results) {
      const items =
        results.items.length > 5 ? results.items.slice(0, 5) : results.items
      const ret = []
      for (const item of items) {
        if (item && item.item) {
          ret.push(item.item)
        }
      }

      this.results = ret
      return ret
    },
    select() {
      // DOM not updated yet.
      this.$nextTick(this.search)
    },
    search() {
      const term = this.$refs.autocomplete.$refs.input.value
      this.$router.push('/find/search/' + term)
    },
    loadMore: function($state) {
      this.busy = true

      const term = this.$refs.autocomplete.$refs.input.value
      const postcode = this.$store.getters['compose/getPostcode']

      if (!postcode) {
        // No postcode.  This can happen if we are called before the store has loaded.
        return
      }

      const currentCount = this.messages.length

      let params = null

      if (term) {
        params = {
          collection: 'Approved',
          summary: true,
          messagetype: this.searchtype,
          context: this.context,
          search: term,
          nearlocation: postcode ? postcode.id : null,
          subaction: 'searchmess'
        }
      } else {
        params = {
          collection: 'Approved',
          summary: true,
          types: [this.searchtype],
          context: this.context
        }
      }

      const groupid = this.$store.getters['compose/getGroup']
      params.groupid = groupid

      this.$store
        .dispatch('messages/fetchMessages', params)
        .then(() => {
          this.busy = false

          this.context = this.$store.getters['messages/getContext']

          if (currentCount === this.messages.length) {
            this.complete = true
            $state.complete()
          } else {
            $state.loaded()
          }
        })
        .catch(() => {
          $state.complete()
        })
    },
    changetype: function() {
      // Reset the messages to force refetch.
      this.$store.dispatch('messages/clear')
    }
  },

  head() {
    return this.buildHead(this.term ? 'Search results: ' + this.term : 'Search')
  }
}
</script>
