const { BanditBot, linearDistribution } = require('./bandit')

jest.mock('./connection')

const actionSpace = ['A', 'B', 'C']
const rewardBounds = [-100, 100]
const numberOfMoves = 5
const bot = new BanditBot({ actionSpace, rewardBounds, numberOfMoves });
bot.sendStartMessage = jest.fn()
bot.sendGuessMessage = jest.fn()
bot.sendNotAGuessMessage = jest.fn()
bot.sendNotStartedMessage = jest.fn()
bot.sendNoCommandsMessage = jest.fn()
bot.sendGameOverMessage = jest.fn()

beforeEach(() => {
  bot.sendStartMessage.mockReset()
  bot.sendGuessMessage.mockReset()
  bot.sendNotAGuessMessage.mockReset()
  bot.sendNotStartedMessage.mockReset()
  bot.sendNoCommandsMessage.mockReset()
  bot.sendGameOverMessage.mockReset()
  bot.game.resetGame()
})

test('Bot does not accept a guess unless the game is started', () => {
  const guess = actionSpace[0]
  const text = `<@TESTID> guess ${guess}`
  const user = 'GUESSBOT'

  bot._handleMessage({ text, user })

  expect(bot.sendNotStartedMessage).toBeCalledWith(user)
})

test('Bot starts game for user and accepts guesses', () => {
  const user = 'GUESSBOT'
  const guess = actionSpace[0]

  bot._handleMessage({ text: '<@TESTID> start', user })
  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user })

  expect(bot.sendStartMessage).toBeCalledWith(user, actionSpace)
  expect(bot.sendGuessMessage.mock.calls[0][0]).toBe(user)
  expect(bot.sendGuessMessage.mock.calls[0][1]).toBe(guess)
  expect(bot.sendGuessMessage.mock.calls[0][4]).toBe(numberOfMoves - 1)
})

test('Bot does not accept an invalid guess', () => {
  const user = 'GUESSBOT'
  const guess = 'DEFINITELY_NEVER_USE_THIS_AS_A_POSSIBLE_GUESS'
  const text = `<@TESTID> guess ${guess}`

  bot._handleMessage({ text: '<@TESTID> start', user })
  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user })

  expect(bot.sendStartMessage).toBeCalledWith(user, actionSpace)
  expect(bot.sendNotAGuessMessage).toBeCalledWith(user, actionSpace)
})

test('Bot ends game after correct number of moves', () => {
  const user = 'GUESSBOT'
  const guess = actionSpace[0]
  const text = `<@TESTID> guess ${guess}`

  bot._handleMessage({ text: '<@TESTID> start', user })
  let currentGuess = numberOfMoves
  while (currentGuess !== 0) {
    bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user })
    currentGuess -= 1
  }

  expect(bot.sendGameOverMessage).toHaveBeenCalled()
})

test('Linear distribution', () => {
  const testDistribution = (range, length, expectation) => {
    const result = linearDistribution([-2, 2], 5)
    const expected = [-2, -1, 0, 1, 2]

    expect(result).toEqual(expected)
  }

  testDistribution([-2, 2], 5, [-2, -1, 0, 1, 2])
  testDistribution([-100, 100], 5, [-100, 0, 100])
  testDistribution([-10, 10], 6, [-10, -6, -2, 2, 6, 10])
})

