require('dotenv').config({silent: true})
const { startRE, guessRE } = require('./bots/guess_bot.js')

var Connection = require('./connection')

const EXPLORATION_SPACE = ['A', 'B', 'C', 'D', 'E', 'F']
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
    rewardValues.push(spacing * currentIndex + lowBound)
    currentIndex += 1
  }
  return rewardValues
}


class BanditBot {
  constructor(config) {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL

    this.connection = new Connection()
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })
    this.connection.start().then(this._setBotId)

    this.commands = ["start", "guess"];
    this.config = config
    this.state = {};
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
      \ Moves Remianing: ${moves}\n
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

  makeGuess(user, guess, options) {
    let playerState = this.state[user];
    let reward = playerState.rewards[guess];
    playerState.total += reward
    playerState.moves -= 1

    this.sendGuessMessage(user, guess, reward, playerState.total, playerState.moves)

    if (playerState.moves <= 0) {
      this.resetGame(user)
      this.sendGameOverMessage(user, playerState.total)
    }
  }

  resetGame(user) {
    delete this.state[user];
  }

  generateInitialState() {
    const { rewardBounds, explorationSpace, numberOfMoves } = this.config
    const rewards = {}
    const rewardValues = shuffle(
      linearDistribution(rewardBounds, explorationSpace.length)
    )

    explorationSpace.forEach((word, index) => {
      rewards[word] = rewardValues[index]
    })

    return {
      total: 0,
      moves: numberOfMoves,
      rewards,
    }
  }

  handleDirectedMessage(message) {
    const { text, user } = message

    if (text.match(startRE)) {
      const userState = this.generateInitialState()
      this.state[user] = userState
      this.sendStartMessage(user, Object.keys(userState.rewards));
    } else if (text.match(guessRE)) {
      const userState = this.state[user]
      if (userState) {
        const guess = text.split(guessRE)[1].trim()
        const options = Object.keys(userState.rewards)

        if (options.includes(guess)) {
          this.makeGuess(user, guess, options)
        } else {
          this.sendNotAGuessMessage(user, options)
        }
      } else {
        this.sendNotStartedMessage(user)
      }
    } else {
      this.sendNoCommandsMessage(user);
    }
  }

  _handleMessage(message) {
    // NOTE: Be very careful here. If the botId is not checked for properly
    // it will result in an infinite loop.
    if (message.text.includes(`<@${this.botId}>`) && message.user != this.botId)
    {
      this.handleDirectedMessage(message);
    }
  }
}

new BanditBot({
  explorationSpace: EXPLORATION_SPACE,
  rewardBounds: REWARD_BOUNDS,
  numberOfMoves: NUMBER_OF_MOVES,
});

module.exports = {
  BanditBot,
  shuffle,
  linearDistribution,
}
