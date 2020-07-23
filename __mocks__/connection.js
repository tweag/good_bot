class Connection {
  _receive = () => {}

  start () {
    return Promise.resolve('TESTID')
  }

  send = () => {}

  onChannelMessage = () => {}
}

module.exports = Connection
