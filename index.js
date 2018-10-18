var RTM_EVENTS = require('@slack/client').RTM_EVENTS
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM

var RtmClient = require('@slack/client').RtmClient
var MemoryDataStore = require('@slack/client').MemoryDataStore

class Connection {
  constructor ({ token, callback }) {
    this.listeners = {}

    this.rtm = new RtmClient(token, { dataStore: new MemoryDataStore() })
    this.rtm.start()
    this.rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, (data) => {
      this.botId = data.self.id
      if (callback) {
        callback()
      }
    })
    this.rtm.on(RTM_EVENTS.MESSAGE, this.receive.bind(this))
  }

  getChannelByName (channelName) {
    return this.rtm.dataStore.getChannelByName(channelName)
  }

  getChannelById (channelId) {
    return this.rtm.dataStore.getChannelById(channelId)
  }

  send ({ channel: channelName, message }) {
    let channel = this.getChannelByName(channelName)
    if (channel) {
      this.rtm.sendMessage(message, channel.id)
    }
  }

  receive (message) {
    let channel = this.getChannelById(message.channel)
    if (channel) {
      let listener = this.listeners[channel.name]
      if (listener && !message.subtype && !message.bot_id) {
        listener(message.text)
      }
    }
  }

  listen ({ channel, callback }) {
    console.log('listening to ' + channel)
    this.listeners[channel] = callback
  }
}

module.exports = Connection
