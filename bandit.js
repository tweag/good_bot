require('dotenv').config({silent: true})
const { startRE, guessRE } = require('./bots/guess_bot.js')

var Connection = require('./connection')

const ACTION_SPACE = ['A', 'B', 'C', 'D', 'E', 'F']
const REWARD_BOUNDS = [-100, 100]
const NUMBER_OF_MOVES = 25

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

class BanditGame {
  constructor (config) {
    this.config = config
    this.state = {}
  }

  getState(user) {
    return this.state[user]
  }

  getUserActions(state) {
    return Object.keys(state.rewards)
  }

  generateInitialState() {
    const { rewardBounds, actionSpace, numberOfMoves } = this.config
    const rewards = {}
    const rewardValues = shuffle(
      linearDistribution(rewardBounds, actionSpace.length)
    )

    actionSpace.forEach((word, index) => {
      rewards[word] = rewardValues[index]
    })

    return {
      total: 0,
      moves: numberOfMoves,
      rewards,
    }
  }

  resetGame(user) {
    delete this.state[user];
  }

  startGame(user) {
    const state = this.generateInitialState()
    const actions = this.getUserActions(state)
    this.state[user] = state
    return { state, actions }
  }

  makeGuess(user, guess) {
    const state = this.state[user];

    if (!state) {
      return { error: NOT_STARTED }
    }

    if (!this.getUserActions(state).includes(guess)) {
      return { error: UNAVAILABLE_ACTION, actions: this.getUserActions(state) }
    }

    const reward = state.rewards[guess];
    const newState = {
      ...state,
      total: state.total + reward,
      moves: state.moves - 1,
    }
    this.state[user] = newState

    let ended = false
    if (newState.moves <= 0) {
      this.resetGame(user)
      ended = true
    }

    return { error: null, state: newState, guess, reward, ended }
  }
}

class BanditBot {
  constructor(config) {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL

    this.connection = new Connection()
    this.connection.onChannelMention({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })
    this.connection.start().then(this._setBotId)

    this.game = new BanditGame(config)

    this.commands = ["start", "guess"];
  }

  _setBotId = (id) => {
    this.botId = id
  }

  send(message) {
    this.connection.send({ channel: this.SLACK_CHANNEL, message })
  }

  sendNoCommandsMessage(user) {
    this.send(`<@${user}> Unrecognized command. Available commands are: ${this.commands.join(", ")}`);
  }

  sendNotStartedMessage(user) {
    this.send(`<@${user}> You didn't start a game!
      \ Start a game by writing \`<@${this.botId}> start\``);
  }

  sendStartMessage(user, options) {
    this.send(`<@${user}> You've started a game.
      \ Your options are ${options}.
      \ Attempt a guess by writing \`<@${this.botId}> guess {option}\`\n
      \ begin ${options}`);
  }

  sendGuessMessage(user, guess, reward, total, moves) {
    this.send(`<@${user}> You guessed "${guess}".
      \ Reward: ${reward}.
      \ Total Score: ${total}.
      \ Moves Remaining: ${moves}\n
      \ reward ${reward}, ${guess}, ${total}, ${moves}`)
  }

  sendGameOverMessage(user, total) {
      this.send(`<@${user}> Game over.
        \ Your score was: ${total}`);
  }

  sendNotAGuessMessage(user, options) {
    this.send(`<@${user}> You didn't take a possible action.
      \ Your options are ${options.join(", ")}.
      \ Attempt a guess by writing \`<@${this.botId}> guess {option}\``);
  }

  _handleMessage(message) {
    const { text, user } = message

    if (text.match(startRE)) {
      const { actions } = this.game.startGame(user)
      this.sendStartMessage(user, actions);

    } else if (text.match(guessRE)) {
      const guess = text.split(guessRE)[1].trim()
      const { error, actions, state, reward, ended } = this.game.makeGuess(user, guess)

      if (error === NOT_STARTED) {
        this.sendNotStartedMessage(user)
      } else if (error === UNAVAILABLE_ACTION) {
        this.sendNotAGuessMessage(user, actions)
      } else {
        this.sendGuessMessage(
          user,
          guess,
          reward,
          state.total,
          state.moves
        )
      }

      if (ended) {
        this.sendGameOverMessage(user, state.total)
      }

    } else {
      this.sendNoCommandsMessage(user);
    }
  }
}

new BanditBot({
  actionSpace: ACTION_SPACE,
  rewardBounds: REWARD_BOUNDS,
  numberOfMoves: NUMBER_OF_MOVES,
});

module.exports = {
  BanditBot,
  shuffle,
  linearDistribution,
}
