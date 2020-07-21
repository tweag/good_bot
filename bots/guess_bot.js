require('dotenv').config({silent: true})

var Connection = require('../connection')

const startWord = 'start'
const guessWord = 'guess'
const beginWord = 'begin'
const rewardWord = 'reward'

const startRE = new RegExp(startWord)
const guessRE = new RegExp(guessWord)
const beginRE = new RegExp(beginWord)
const rewardRE = new RegExp(rewardWord)

class GuessBot {
  constructor() {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL
    this.connection = new Connection()
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })
    this.connection.start().then(this._setId)
  }

  _setId = (id) => {
    this.id = id
    this.myselfRE = new RegExp(id)
  }

  _handleBegin(text, godBotId) {
    const parts = text.split(beginRE)
    const actionSpace = parts[1].trim().split(', ')
    this.handleExplorationSpace(actionSpace, godBotId)
  }

  _handleReward(text, godBotId) {
    const parts = text.split(rewardRE)
    const [reward, guess, totalScore, remaining] = parts[1].trim().split(', ')
    this.handleReward({
      guess,
      reward: parseFloat(reward),
      totalScore: parseFloat(totalScore),
      remaining: parseInt(remaining)
    }, godBotId)
  }

  _handleMessage(message) {
    const { text } = message
    if (message.subtype === 'bot_message') {
      // The bot/user that is being messaged is not in this channel
      this.send("Is it possible that bot is not here?")

    } else if (text && text.match(this.myselfRE)) {
      if (text.match(beginRE)) {
        this._handleBegin(text, message.user)
      } else if (text.match(rewardRE)) {
        this._handleReward(text, message.user)
      }
    }
  }

  send(message) {
    setTimeout(() => {
      this.connection.send({ channel: this.SLACK_CHANNEL, message })
    }, 1000)
  }
}

module.exports = { GuessBot, startWord, guessWord }
