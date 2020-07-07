const { RTMClient } = require('@slack/rtm-api');

class Connection {
  constructor ({ token, callback }) {
    this.listeners = {}
    this.rtm = new RTMClient(token);
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

  listen ({ channel, callback }) {
    this.listeners[channel] = callback
  }
}

module.exports = Connection
