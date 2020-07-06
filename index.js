var SlackBot = require('./slack_bot')

class MyBot extends SlackBot {
  aliveResponse (message) {
    if (message.text === 'who is alive') {
      this.send('I am')
    }
  }

  dyingWords () {
    this.send("AARRHHHHGGGGGGG!!!")
  }

  deadResponse(message) {
    if (message.text === 'who is dead') {
      this.send('I am')
    }
  }
}

const bot = new MyBot()
