const { GuessBot } = require('./guess_bot')

jest.mock('../connection')

class TestBot extends GuessBot {
  handleReward = jest.fn()
  handleGameStart = jest.fn()
  handleGameOver = jest.fn()
}

test('Handles reward message properly', () => {
  const bot = new TestBot()
  const text = `<@TESTID> You got a response reward 10.1, jump, 90.9, 100`
  const user = 'GODBOT'

  bot._handleMention({ text, user })
  expect(bot.handleReward).toBeCalledWith({
    reward: 10.1,
    guess: 'jump',
    totalScore: 90.9,
    remaining: 100
  }, user);
})

test('Handles begin message properly', () => {
  const bot = new TestBot()
  const text = `<@TESTID> Are you ready? begin jump, run, fly`
  const user = 'GODBOT'
  const expectedSpace = ['jump', 'run', 'fly']

  bot._handleMention({ text, user })
  expect(bot.handleGameStart).toBeCalledWith(expectedSpace, user);
})

test('Handles begin message properly', () => {
  const bot = new TestBot()
  const text = `<@TESTID> Game Over! gameover 1000`
  const user = 'GODBOT'
  const expectedTotal = 1000

  bot._handleMention({ text, user })
  expect(bot.handleGameOver).toBeCalledWith({ totalScore: expectedTotal }, user);
})
