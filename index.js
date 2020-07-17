const { GuessBot, startWord, guessWord } = require('./bots/guess_bot.js')

const GOD_BOT_ID = '<@U017GNL24JY>'

class MyBot extends GuessBot {
  constructor () {
    super()
    this.start()
  }

  updateActionSpace(space) {
    this.space = space
    console.log(space)
    this.send(`Wow this is hard, I can guess from any of these choices: ${space.join(', ')}`)
    this.makeGuess()
  }

  informResult (reward, guess, totalScore, remaining) {
    console.log(reward, guess, totalScore, remaining)
    this.send(
      `I ${guess}ed and got ${reward} BTC. I have ${remaining} guesses left and I've raked in ${totalScore}`
    )

    // This is where your guess logic goes. The idea is to maximize your total points.
    // Currently, I'm just iterating over the whole action space.
    const nextGuessIndex = (this.space.indexOf(guess) + 1) % this.space.length
    this.makeGuess(this.space[nextGuessIndex])
  }

  makeGuess (guess) {
    this.send(`${GOD_BOT_ID} ${guessWord} ${this.space[0]}`)
  }

  start () {
    this.send(`${GOD_BOT_ID} ${startWord}`)
  }
}

const bot = new MyBot()
