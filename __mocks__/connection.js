class Connection {
  _receive = () => {}

  start () {
    return Promise.resolve('TESTID')
  }

  send = () => {}

  listen = () => {}
}

module.exports = Connection
