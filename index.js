const { GuessBot, startWord, guessWord } = require('./bots/guess_bot.js')

const BANDIT_BOT_ID = '<@U017GNL24JY>'

class MyBot extends GuessBot {
  constructor () {
    super()
    this.banditBotId = BANDIT_BOT_ID
    this.start()
  }

  handleGameStart(actionSpace, banditBotId) {
    if (banditBotId) {
      this.banditBotId = `<@${banditBotId}>`
    }
    this.space = actionSpace
    this.send(`Wow this is hard, what should I choose? ${this.space.join(', ')}`)
    this.makeGuess(this.space[0])
  }

  handleReward ({reward, guess, totalScore, remaining}, banditBotId) {
    this.send(`I ${guess}ed and got ${reward} points.`)

    // This is where your guess logic goes. The idea is to maximize your total points.
    // Currently, I'm just iterating over the whole action space.
    if (remaining > 0) {
      const nextGuessIndex = (this.space.indexOf(guess) + 1) % this.space.length
      this.makeGuess(this.space[nextGuessIndex])
    }
  }

  handleGameOver ({ totalScore }, banditBotId) {
    this.send(`I scored a total of ${totalScore} points.`)
  }

  makeGuess (guess) {
    this.send(`${this.banditBotId} ${guessWord} ${guess}`)
  }

  start () {
    this.send(`${this.banditBotId} ${startWord}`)
  }
}

const bot = new MyBot()
