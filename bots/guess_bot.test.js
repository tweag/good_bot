const { GuessBot } = require('./guess_bot')

jest.mock('../connection')

class TestBot extends GuessBot {
  handleReward = jest.fn()
  handleExplorationSpace = jest.fn()
}

test('Handles reward message properly', () => {
  const text = `<@TESTID> You got a response reward 10, jump, 90, 100`
  const bot = new TestBot()

  bot._handleMessage({ text })
  expect(bot.handleReward).toBeCalledWith('10', 'jump', '90', '100');
})

test('Handles begin message properly', () => {
  const bot = new TestBot()
  const text = `<@TESTID> Are you ready? begin jump, run, fly`
  const user = 'GODBOT'
  const expectedSpace = ['jump', 'run', 'fly']

  bot._handleMessage({ text, user })
  expect(bot.handleExplorationSpace).toBeCalledWith(expectedSpace, user);
})
