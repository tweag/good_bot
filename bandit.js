require('dotenv').config({silent: true})
const { startRE, guessRE } = require('./bots/guess_bot.js')

var Connection = require('./connection')

const EXPLORATION_SPACE = ['A', 'B', 'C', 'D', 'E', 'F']
const REWARD_BOUNDS = [-100, 100]

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
  constructor() {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL

    this.connection = new Connection()
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this._handleMessage.bind(this),
    })
    this.connection.start().then(this._setBotId)

    this.commands = ["start", "guess"];
    this.state = {};
  }

  _setBotId = (id) => {
    this.botId = id
  }

  send(message) {
    this.connection.send({ channel: this.SLACK_CHANNEL, message })
  }

  sendNoCommandsMessage(message)
  {
    this.send(`<@${message.user}> Unrecognized command. Available commands are: ${this.commands.join(", ")}`);
  }

  sendStartMessage(message) {
    let options = Object.keys(this.state[message.user].rewards).join(", ");
    this.send(`<@${message.user}> You've started a game.
      \ Your options are ${options}.
      \ Attempt a guess by writing \`<@${this.botId}> guess {option}\`\n
      \ begin ${options}`);
  }

  sendGuessMessage(message) {
    let options = Object.keys(this.state[message.user].rewards);
    let playerState = this.state[message.user];
    let guess = message.text.replace(`<@${this.botId}>`, "");
    guess = guess.replace("guess", "").trim();

    if (options.includes(guess)) {
      let reward = playerState.rewards[guess];
      playerState.total += reward;

      this.send(`<@${message.user}> You guessed "${guess}".
        \ Reward: ${reward}. 
        \ Total Score: ${playerState.total}. 
        \ Moves Remianing: ${--playerState.moves}\n
        \ reward ${reward}, ${guess}, ${playerState.total}, ${playerState.moves}`)

      if (playerState.moves <= 0) {
        delete this.state[message.user];
        this.send(`<@${message.user}> Game over.
          \ Your score was: ${playerState.total}`);
      }
    }

    else {
      this.send(`<@${message.user}> You didn't take a possible action.
        \ Your options are ${options.join(", ")}.
        \ Attempt a guess by writing \`<@${this.botId}> guess {option}\``);
    }
  }

  generateRewards() {
    const rewards = {}
    const rewardValues = shuffle(
      linearDistribution(REWARD_BOUNDS, EXPLORATION_SPACE.length)
    )

    EXPLORATION_SPACE.forEach((word, index) => {
      rewards[word] = rewardValues[index]
    })

    return rewards;
  }

  handleDirectedMessage(message) {
    const { text } = message

    if (text.match(startRE)) {
      this.state[message.user] = {
        total: 0,
        moves: 25,
        rewards: this.generateRewards()
      }

      this.sendStartMessage(message);
    } else if (text.match(guessRE)) {
      if (this.state[message.user]) {
        this.sendGuessMessage(message);
      }

      else {
        this.send(`<@${message.user}> You didn't start a game!
          \ Start a game by writing \`<@${this.botId}> start\``);
      }
    } else {
      this.sendNoCommandsMessage(message);
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

new BanditBot();

module.exports = { BanditBot, shuffle, linearDistribution }
