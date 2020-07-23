class Connection {
  _receive = () => {}

  start () {
    return Promise.resolve('TESTID')
  }

  send = () => {}

  onMessage = () => {}

  onMention = () => {}

  onChannelMessage = () => {}

  onChannelMention = () => {}
}

module.exports = Connection
