<template>
  <div>
    <b-modal
      id="promisemodal"
      v-model="showModal"
      :title="message.subject"
      size="lg"
      no-stacking
    >
      <template slot="default">
        <b-row>
          <b-col class="text-center">
            <p>Letting us know what happened to a post is really helpful.</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-select v-model="type" class="font-weight-bold" @change="changeType">
              <option value="Taken">
                Taken by
              </option>
              <option value="Received">
                Received from
              </option>
              <option value="Withdrawn">
                Withdrawn
              </option>
            </b-select>
          </b-col>
          <b-col>
            <b-select
              v-if="type === 'Taken' || type === 'Received'"
              ref="userselect"
              v-model="selectedUser"
              autofocus
              :options="userOptions"
              :class="'mb-2 font-weight-bold ' + (selectedUser === -1 ? 'text-danger' : '')"
              @change="fetchUser"
            />
          </b-col>
        </b-row>
        <b-row v-if="selectedUser > 0">
          <b-col class="text-center">
            <b-card bg-variant="info">
              <b-card-body>
                <p>How was this freegler? Please click.</p>
                <Ratings :key="'user-' + selectedUser" v-bind="fetchedUser" class="" />
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center">
            <hr>
            <p class="mt-2">
              How do you feel about freegling just now?
            </p>
            <b-button-group>
              <b-button variant="success" size="lg" @click="happiness = 'Happy'">
                <v-icon name="smile" scale="2" /> Happy
              </b-button>
              <b-button variant="white" size="lg" @click="happiness = 'Fine'">
                <v-icon name="meh" scale="2" color="grey" /> Fine
              </b-button>
              <b-button variant="danger" size="lg" @click="happiness = 'Unhappy'">
                <v-icon name="frown" scale="2" /> Sad
              </b-button>
            </b-button-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center">
            <p class="mt-2">
              You can add comments:
            </p>
            <b-textarea v-model="comments" rows="2" max-rows="6" />
            <div class="float-right text-muted mt-2">
              <span v-if="happiness === null || happiness === 'Happy' || happiness === 'Fine'">
                <v-icon name="globe-europe" /> Your comments may be public
              </span>
              <span v-if="happiness === 'Unhappy'">
                <v-icon name="lock" /> Your comments will only go to our volunteers
              </span>
            </div>
          </b-col>
        </b-row>
      </template>
      <template slot="modal-footer">
        <b-button variant="white" @click="hide">
          Cancel
        </b-button>
        <b-button variant="success" :disabled="submitDisabled" @click="submit">
          Submit
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<style scoped lang="scss">
@import 'color-vars';

option {
  color: $color-black !important;
}
</style>

<script>
import Ratings from './Ratings'

export default {
  components: {
    Ratings
  },
  props: {
    message: {
      type: Object,
      required: true
    },
    users: {
      validator: prop => typeof prop === 'object' || prop === null,
      required: true
    }
  },
  data: function() {
    return {
      showModal: false,
      type: null,
      happiness: null,
      comments: null,
      selectedUser: null,
      fetchedUser: null
    }
  },
  computed: {
    submitDisabled() {
      const ret = this.type !== 'Withdrawn' && this.selectedUser < 0
      return ret
    },
    userOptions() {
      const options = []

      if (this.users) {
        options.push({
          value: -1,
          html: "<em>-- Please choose (this isn't public) --</em>"
        })

        for (const user of this.users) {
          options.push({
            value: user.id,
            text: user.displayname
          })
        }

        options.push({
          value: 0,
          html: '<em>Someone else</em>'
        })
      }

      return options
    },

    groupid() {
      let ret = null

      if (this.message && this.message.groups && this.message.groups.length) {
        ret = this.message.groups[0].groupid
      }

      return ret
    }
  },
  mounted() {
    if (this.$refs.userselect) {
      this.$refs.userselect.show()
    }
  },
  methods: {
    async submit() {
      await this.$store.dispatch('messages/update', {
        action: 'Outcome',
        id: this.message.id,
        outcome: this.type,
        happiness: this.happiness,
        comments: this.comments,
        userid: this.selectedUser
      })

      this.hide()
    },

    setComments() {
      switch (this.type) {
        case 'Taken':
          this.comments = 'Thanks, this has now been taken.'
          break
        case 'Received':
          this.comments = 'Thanks, this has now been received.'
          break
        case 'Withdrawn':
          this.comments = 'Sorry, this is no longer available.'
          break
      }
    },

    show(type) {
      this.showModal = true
      this.type = type
      this.setComments()
      this.selectedUser = this.users.length ? -1 : 0
    },

    hide() {
      // We're having trouble capturing events from this modal, so use root as a bus.
      this.$root.$emit('outcome', this.groupid)
      this.showModal = false
    },

    changeType() {
      this.selectedUser = -1
      this.setComments()
    },

    async fetchUser(userid) {
      await this.$store.dispatch('user/fetch', {
        id: userid,
        info: true
      })

      this.fetchedUser = this.$store.getters['user/get'](userid)
    }
  }
}
</script>
