<template>
  <b-col>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6">
        <h1 class="text-center">
          Terms of Use
        </h1>
        <p>
          We could give you a ten page long Terms of Use.  Like you'd read that.
        </p>
        <p>
          As far as we're concerned, it's simple:
        </p>
        <ol class="">
          <li>Use Freegle to pass on unwanted items direct to others.</li>
          <li>Everything must be free and legal.</li>
          <li>Be nice to other freeglers, and they'll be nice to you.</li>
          <li>
            We don't see or check items offered - see our <nuxt-link to="/disclaimer">
              disclaimer.
            </nuxt-link>
          </li>
          <li>
            Freegle communities may have additional rules.  If you have questions, find your community from the <nuxt-link to="/explore">
              Explore
            </nuxt-link> page and use the <em>Contact</em> button.
          </li>
          <li>
            Please <nuxt-link to="/disclaimer">
              keep yourself safe and watch out for scams.
            </nuxt-link>
          </li>
          <li>Objectionable content or behaviour will not be tolerated.</li>
          <li>
            If you see anything inappropriate, suspicious or just dodgy then please <nuxt-link to="/help">
              report it
            </nuxt-link>.
          </li>
          <li>You must be aged 13 or over, as there is user-generated content.</li>
          <li>
            We won’t sell your email address to anyone else - see <nuxt-link to="/privacy">
              privacy page.
            </nuxt-link>
          </li>
          <li>
            We will email you posts, replies, events, newsletters, etc - control these in <nuxt-link to="/settings">
              Settings.
            </nuxt-link>
          </li>
          <li>
            We will make your post public to publicise Freegle but not your email address - see <nuxt-link to="/privacy">
              privacy page
            </nuxt-link>.
          </li>
        </ol>
        <h3>Got questions?</h3>
        <p>
          If you have questions, please <nuxt-link to="/help">
            contact us.
          </nuxt-link>
        </p>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </b-col>
</template>
<script>
import buildHead from '@/mixins/buildHead.js'

export default {
  mixins: [buildHead],
  head() {
    return this.buildHead(
      'Terms of Use',
      "Our Terms of Use.  They're pleasingly short."
    )
  }
}
</script>
