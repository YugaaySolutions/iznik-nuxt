import Vue from 'vue'

export const state = () => ({
  // Use object not array otherwise we end up with a huge sparse array which hangs the browser when saving to local
  // storage.  Sparse arrays also kill Vue performance.
  messages: {},
  users: {},
  contexts: {}
})

export const mutations = {
  clearMessages(state) {
    Object.assign(state.messages, {})
  },

  mergeMessages(state, payload) {
    const chatid = payload.id + ''
    const messages =
      typeof payload.messages === 'object'
        ? Object.values(payload.messages)
        : payload.messages

    if (!state.messages[chatid]) {
      // Again, don't use an array as this will be sparse.
      Vue.set(state.messages, chatid, {})
    }

    for (const message of messages) {
      message.message = message.message + ''
      Vue.set(state.messages[chatid], message.id, message)
    }
  },

  mergeUsers(state, payload) {
    const chatid = payload.id + ''
    const users =
      typeof payload.users === 'object'
        ? Object.values(payload.users)
        : payload.users

    if (!state.users[chatid]) {
      Vue.set(state.users, chatid, [])
    }

    for (const user of users) {
      Vue.set(state.users[chatid], user.id, user)
    }
  },

  setContext(state, params) {
    Vue.set(state.contexts, params.id, params.ctx)
  }
}

export const getters = {
  getMessages: state => chatid => {
    chatid = chatid + ''
    const ret = state.messages[chatid]
      ? Object.values(state.messages[chatid])
      : []
    return ret
  },

  getUsers: state => chatid => {
    return state.users[chatid] ? Object.values(state.users[chatid]) : []
  },

  getContext: state => id => {
    return state.contexts[id]
  }
}

export const actions = {
  clearMessages({ commit, state }, params) {
    commit('clearMessages')
  },

  clearContext({ commit, state }, params) {
    commit('setContext', {
      id: params.chatid,
      ctx: null
    })
  },

  async fetch({ commit, state }, params) {
    const { chatid, noContext } = params

    let ctx = null

    if (!noContext) {
      ctx = state.contexts[chatid] || null
    }

    const { chatmessages, chatusers, context } = await this.$api.chat.fetch(
      chatid,
      {
        limit: 10,
        context: ctx
      }
    )

    commit('mergeMessages', {
      id: chatid,
      messages: chatmessages
    })

    commit('mergeUsers', {
      id: chatid,
      users: chatusers
    })

    if (!noContext) {
      commit('setContext', {
        id: chatid,
        ctx: context || null
      })
    }
  },

  async send({ commit, dispatch }, params) {
    params.modtools = process.env.MODTOOLS

    await this.$api.chat.send(params)

    // Get the latest messages back.  Passing no context will fetch the latest.
    await dispatch('fetch', {
      chatid: params.roomid,
      noContext: true
    })
  },

  async nudge({ commit, dispatch }, { roomid }) {
    await this.$api.chat.nudge(roomid)

    await dispatch('fetch', {
      chatid: roomid,
      noContext: true
    })
  }
}
