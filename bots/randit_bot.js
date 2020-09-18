require('dotenv').config({silent: true})
const {
  startRE,
  guessRE,
  startWord,
  beginWord,
  guessWord,
  rewardWord,
  endWord
} = require('./guess_bot.js')

var Connection = require('../connection')

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

function linearDistribution(inclusiveBounds, length) {
  const [lowBound, highBound] = inclusiveBounds
  const spacing = (highBound - lowBound) / (length - 1)

  let currentIndex = 0
  let rewardValues = []
  while (length !== currentIndex) {
    rewardValues.push(Math.floor(spacing * currentIndex + lowBound))
    currentIndex += 1
  }
  return rewardValues
}

const NOT_STARTED = "NOT_STARTED"
const UNAVAILABLE_ACTION = "UNAVAILABLE_ACTION"

class RanditGame {
  constructor (config) {
    this.config = config
    this.state = {}
  }

  getState(gameId) {
    return this.state[gameId]
  }

  getActions(state) {
    return Object.keys(state.payoutChances)
  }

  generateInitialState() {
    const { payoutAmount, payoutChanceBounds, actionSpace, numberOfMoves } = this.config
    const payoutChances = {}
    const payoutChanceValues = shuffle(
      linearDistribution(payoutChanceBounds, actionSpace.length)
    )

    actionSpace.forEach((word, index) => {
      payoutChances[word] = payoutChanceValues[index]
    })

    return {
      total: 0,
      moves: numberOfMoves,
      payoutAmount,
      payoutChances,
    }
  }

  resetGame(gameId) {
    delete this.state[gameId];
  }

  startGame(gameId) {
    const state = this.generateInitialState()
    const actions = this.getActions(state)
    this.state[gameId] = state
    return { state, actions }
  }

  calculatePayout(guess, state) {
    const payoutChance = state.payoutChances[guess];
    const shouldPayout = (Math.random() * 100) < payoutChance;
    return shouldPayout ? state.payoutAmount : 0
  }

  makeGuess(gameId, guess) {
    const state = this.state[gameId];

    if (!state) {
      return { error: NOT_STARTED }
    }

    if (!this.getActions(state).includes(guess)) {
      return { error: UNAVAILABLE_ACTION, actions: this.getActions(state) }
    }

    const reward = this.calculatePayout(guess, state)

    const newState = {
      ...state,
      total: state.total + reward,
      moves: state.moves - 1,
    }
    this.state[gameId] = newState

    let ended = false
    if (newState.moves <= 0) {
      this.resetGame(gameId)
      ended = true
    }

    return { error: null, state: newState, guess, reward, ended }
  }
}

class RanditBot {
  constructor(config) {
    this.connection = new Connection()
    this.connection.onMention({
      callback: this._handleMessage.bind(this),
    })
    this.connection.start().then(this._setBotId)

    this.game = new RanditGame(config)

    this.commands = ["start", "guess"];
  }

  _setBotId = (id) => {
    this.botId = id
  }

  send(message, channel) {
    this.connection.send({ channel, message })
  }

  sendNoCommandsMessage(user, channel) {
    const message = `<@${user}> Unrecognized command. Available commands are: ${this.commands.join(", ")}`
    this.send(message, channel)
  }

  sendNotStartedMessage(user, channel) {
    const message = `<@${user}> You didn't start a game!
      \ Start a game by writing \`<@${this.botId}> ${startWord}\``
    this.send(message, channel)
  }

  sendStartMessage(user, channel, { actions }) {
    const message = `<@${user}> You've started a game.
      \ Your actions are ${actions.join(", ")}.
      \ Attempt a guess by writing \`<@${this.botId}> ${guessWord} {action}\`\n
      \ ${beginWord} ${actions.join(", ")}`

    this.send(message, channel)
  }

  sendGuessMessage(user, channel, { guess, reward, total, moves }) {
    const preMessage = `<@${user}> You ${guess}d...`

    this.send(preMessage, channel)

    let messagePreamble = "...and you were awarded!"
    if (reward == 0) {
        messagePreamble = "...and nothing was gained."
    }

    const message = `<@${user}> ${messagePreamble}
      \ Reward: ${reward}.
      \ Total Score: ${total}.
      \ Moves Remaining: ${moves}\n
      \ ${rewardWord} ${reward}, ${guess}, ${total}, ${moves}`

    setTimeout(() => this.send(message, channel), 2000)
  }

  sendGameOverMessage(user, channel, { total }) {
    const message = `<@${user}> Game over.
      \ Your score was: ${total}
      \ ${endWord} ${total}`


    this.send(message, channel)
  }

  sendNotAGuessMessage(user, channel, { actions }) {
    const message = `<@${user}> You didn't take a possible action.
      \ Your actions are ${actions.join(", ")}.
      \ Attempt a guess by writing \`<@${this.botId}> ${guessWord} {action}\``

    this.send(message, channel)
  }

  _handleMessage(message) {
    const { text, user, channel } = message
    const gameId = `${user}:${channel}`

    if (text.match(startRE)) {
      const { actions } = this.game.startGame(gameId)
      this.sendStartMessage(user, channel, { actions });

    } else if (text.match(guessRE)) {
      const guess = text.split(guessRE)[1].trim()
      const { error, actions, state, reward, ended } = this.game.makeGuess(gameId, guess)

      if (error === NOT_STARTED) {
        this.sendNotStartedMessage(user, channel)
      } else if (error === UNAVAILABLE_ACTION) {
        this.sendNotAGuessMessage(user, channel, { actions })
      } else {
        this.sendGuessMessage(user, channel, {
          guess,
          reward,
          total: state.total,
          moves: state.moves
        })
      }

      if (ended) {
        this.sendGameOverMessage(user, channel, { total: state.total })
      }

    } else {
      this.sendNoCommandsMessage(user, channel);
    }
  }
}

module.exports = {
  RanditBot,
  shuffle,
  linearDistribution,
}
