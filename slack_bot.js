require('dotenv').config({silent: true})

var Connection = require('./connection')


class SlackBot {
  constructor() {
    const requiredMethods = ['dyingWords', 'aliveResponse', 'deadResponse']
    for (const method of requiredMethods) {
      if (!this[method]) {
        throw new Error(`You must implement "${method}"`)
      }
    }

    this.TOKEN = process.env.TOKEN
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL
    this.connection = new Connection({ token: this.TOKEN })
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })

    this.deathWords = [
      'die',
      'death',
      'knife',
      'cease',
      'bones',
      'perish',
      'mortal',
      'grave',
      'macabre',
      'croak',
      'drown',
      'bury',
      'pass',
      'entomb',
      'embalm',
      'reaper'
    ]
    this.weakness = this._getDeathWord()
    this.weakRE = new RegExp(this.weakness)
    this.alive = true
  }


  _getDeathWord () {
    const index = Math.floor(Math.random() * (this.deathWords.length))
    return this.deathWords[index]
  }

  send(message) {
    setTimeout(() => {
      if (this.alive) {
        this.connection.send({ channel: this.SLACK_CHANNEL, message })
      } else {
        this.connection.send({
          channel: this.SLACK_CHANNEL,
          message: (':skull_and_crossbones:' + message + ':skull_and_crossbones:')
        })
      }
    }, 1000)
  }

  _handleMessage(message) {
    if (this.alive && message.text.match(this.weakRE)) {
      this.alive = false
      this.dyingWords()
    } else if (this.alive) {
      this.aliveResponse(message)
    } else {
      this.deadResponse(message)
    }
  }

  dyingWords () { }

  handleMessage(message) {
    console.log('Got a message', message)
  }
}

module.exports = SlackBot
