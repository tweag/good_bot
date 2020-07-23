require('dotenv').config({silent: true})
const { RTMClient } = require('@slack/rtm-api');

class Connection {
  constructor () {
    this.listeners = {}
    this.rtm = new RTMClient(process.env.TOKEN);
    this.rtm.on('message', this._receive)
  }

  _receive = event => {
    const listener = this.listeners[event.channel]
    if (listener) {
      listener(event)
    }
  }

  async start () {
    const { self } = await this.rtm.start()
    return self.id
  }

  send ({ channel, message }) {
    this.rtm.sendMessage(message, channel)
  }

  onChannelMessage ({ channel, callback }) {
    this.listeners[channel] = callback
  }
}

module.exports = Connection
