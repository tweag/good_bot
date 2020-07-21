const { GuessBot, startWord, guessWord } = require('./bots/guess_bot.js')

const BANDIT_BOT_ID = '<@U017GNL24JY>'

class MyBot extends GuessBot {
  constructor () {
    super()
    this.banditBotId = BANDIT_BOT_ID
    this.start()
  }

  handleExplorationSpace(space, banditBotId) {
    if (banditBotId) {
      this.banditBotId = `<@${banditBotId}>`
    }
    this.space = space
    this.send(`Wow this is hard, I can guess from any of these choices: ${space.join(', ')}`)
    this.makeGuess(this.space[0])
  }

  handleReward ({reward, guess, totalScore, remaining}, banditBotId) {
    this.send(
      `I ${guess}ed and got ${reward} points. I have ${remaining} guesses left and I've raked in ${totalScore} points`
    )

    // This is where your guess logic goes. The idea is to maximize your total points.
    // Currently, I'm just iterating over the whole action space.
    const nextGuessIndex = (this.space.indexOf(guess) + 1) % this.space.length
    this.makeGuess(this.space[nextGuessIndex])
  }

  makeGuess (guess) {
    this.send(`${this.banditBotId} ${guessWord} ${guess}`)
  }

  start () {
    this.send(`${this.banditBotId} ${startWord}`)
  }
}

const bot = new MyBot()
