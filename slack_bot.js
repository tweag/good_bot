require('dotenv').config({silent: true})

var Connection = require('./connection')

class SlackBot {
  constructor() {
    this.TOKEN = process.env.TOKEN
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL
    this.connection = new Connection({ token: this.TOKEN })
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this.handleMessage.bind(this),
    })
  }

  sendMessage(message) {
    this.connection.send({ channel: this.SLACK_CHANNEL, message })
  }

  handleMessage(receivedMessage) {
    console.log('Got a message', receivedMessage)
  }
}

module.exports = SlackBot
