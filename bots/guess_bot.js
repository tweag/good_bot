require('dotenv').config({silent: true})

var Connection = require('../connection')

const startWord = 'start'
const guessWord = 'guess'
const beginWord = 'begin'
const rewardWord = 'reward'
const endWord = 'gameover'


const startRE = new RegExp(startWord)
const guessRE = new RegExp(guessWord)
const beginRE = new RegExp(beginWord)
const rewardRE = new RegExp(rewardWord)
const endRE = new RegExp(endWord)

class GuessBot {
  constructor() {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL
    this.connection = new Connection()
    this.connection.onChannelMessage({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })
    this.connection.onChannelMention({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMention.bind(this),
    })
    this.connection.start()
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

  _handleEnd(text, godBotId) {
    const parts = text.split(endRE)
    const totalScore = parts[1].trim()
    this.handleGameOver({
      totalScore: parseFloat(totalScore),
    }, godBotId)
  }

  _handleMessage(message) {
    // Ephemeral messages can mean that we just mentioned someone
    // who is not in this channel
    if (message.is_ephemeral) {
      this.send("Is it possible that bot is not here?")
    }
  }

  _handleMention(message) {
    const { text } = message
    if (text.match(beginRE)) {
      this._handleBegin(text, message.user)
    } else if (text.match(rewardRE)) {
      this._handleReward(text, message.user)
    } else if (text.match(endRE)) {
      this._handleEnd(text, message.user)
    }
  }

  send(message) {
    setTimeout(() => {
      this.connection.send({ channel: this.SLACK_CHANNEL, message })
    }, 500)
  }
}

module.exports = {
  GuessBot,
  startWord,
  beginWord,
  guessWord,
  rewardWord,
  endWord,
  startRE,
  guessRE
}
