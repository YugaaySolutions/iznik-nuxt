import Vue from 'vue'

export const state = () => ({
  // Use object not array otherwise we end up with a huge sparse array which hangs the browser when saving to local
  // storage.
  list: {}
})

export const mutations = {
  addRoom(state, item) {
    // This might be a number and therefore not of string type
    item.snippet = item.snippet + ''

    Vue.set(state.list, parseInt(item.id), item)
  },

  setList(state, chats) {
    if (chats) {
      // We might have chats that have been removed.  Look for ids in our store that are not in the list, and remove
      // them.  This is a common case when blocking a user.
      const existingIds = Object.keys(state.list).map(a => parseInt(a))
      const newIds = chats.map(a => a.id)
      const removed = existingIds.filter(a => !newIds.includes(a))
      removed.forEach(id => {
        Vue.delete(state.list, id)
      })

      for (const chat of chats) {
        // We might have a copy of the chat in store already.  If so, it may have more info than we have fetched
        // this time, so merge it.
        chat.snippet = chat.snippet + ''

        Vue.set(
          state.list,
          parseInt(chat.id),
          Object.assign(state.list[chat.id] || {}, chat)
        )
      }
    }
  }
}

export const getters = {
  get: state => id => {
    let ret = null

    Object.keys(state.list).forEach(key => {
      const chat = state.list[key]

      if (parseInt(key) === parseInt(id)) {
        ret = chat
      }
    })

    return ret
  },

  list: state => {
    return state.list
  },

  getByUser: state => userid => {
    let ret = null

    Object.keys(state.list).forEach(key => {
      const chat = state.list[key]

      if (
        parseInt(chat.user1) === parseInt(userid) ||
        parseInt(chat.user2) === parseInt(userid)
      ) {
        ret = chat
      }
    })

    return ret
  }
}

export const actions = {
  async listChats({ commit }, params) {
    params = params || {
      chattypes: ['User2User', 'User2Mod'],
      summary: true,
      search: params && params.search ? params.search : null
    }
    commit('setList', await this.$api.chat.listChats(params))
  },

  async openChatToMods({ dispatch, commit }, params) {
    const id = await dispatch('openChat', {
      chattype: 'User2Mod',
      groupid: params.groupid
    })

    return id
  },

  async openChatToUser({ dispatch, commit }, params) {
    const id = await dispatch('openChat', {
      chattype: 'User2User',
      userid: params.userid
    })

    return id
  },

  async openChat({ dispatch, commit }, params) {
    const { id } = await this.$api.chat.openChat(params)
    await dispatch('fetch', { id })
    return id
  },

  async fetch({ commit }, { id: chatid }) {
    if (!chatid) return
    const { chatroom } = await this.$api.chat.fetchChat(chatid)
    if (chatroom) {
      // Valid chatid
      commit('addRoom', chatroom)
    } else {
      // Invalid
      console.error('Invalid chat id', chatid)
    }
  },

  async markSeen({ commit, getters, dispatch }, params) {
    const chat = getters.get(params.id)

    if (chat.unseen > 0) {
      await this.$api.chat.markSeen(chat.id, chat.lastmsg)
      await dispatch('fetch', {
        id: params.id
      })
    }
  },

  async hide({ dispatch, commit }, params) {
    await this.$api.chat.hideChat(params.id)
    await dispatch('listChats')
  },

  async block({ dispatch, commit }, params) {
    await this.$api.chat.blockChat(params.id)
    await dispatch('listChats')
  }
}
