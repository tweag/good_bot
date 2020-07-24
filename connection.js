require('dotenv').config({silent: true})
const { RTMClient } = require('@slack/rtm-api');

class Connection {
  constructor () {
    this._listener = null
    this._mentionListener = null
    this._channelListeners = {}
    this._channelMentionListeners = {}
    this.botId = null

    this.rtm = new RTMClient(process.env.TOKEN);
    this.rtm.on('message', this._receive)
  }

  async start () {
    const { self: { id } } = await this.rtm.start()
    this.botId = id
    this.myselfRE = new RegExp(id)
    return id
  }

  _receive = event => {
    const channelListener = this._channelListeners[event.channel]
    const channelMentionListener = this._channelMentionListeners[event.channel]
    if (channelListener) channelListener(event)
    if (channelMentionListener) channelMentionListener(event)
    if (this._listener) this._listener(event)
    if (this._mentionListener) this._mentionListener(event)
  }

  isMentioned (event) {
    const { text, user } = event
    return text && text.match(this.myselfRE) && user !== this.botId
  }

  send ({ channel, message }) {
    this.rtm.sendMessage(message, channel)
  }

  onMessage ({ callback }) {
    this._listener = callback
  }

  onMention ({ callback }) {
    this._mentionListener = (event) => {
      if (this.isMentioned(event)) callback(event)
    }
  }

  onChannelMessage ({ channel, callback }) {
    this._channelListeners[channel] = callback
  }

  onChannelMention ({ channel, callback }) {
    this._channelMentionListeners[channel] = (event) => {
      if (this.isMentioned(event)) callback(event)
    }
  }
}

module.exports = Connection
