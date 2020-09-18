const { RanditBot, linearDistribution } = require('./randit_bot')

jest.mock('../connection')

const actions = ['A', 'B', 'C']
const payoutChanceBounds = [10, 90]
const numberOfMoves = 5
const payoutAmount = 100

const user = 'GUESSBOT'
const channel = 'BOTSTUFF'
const gameId = 'GUESSBOT:BOTSTUFF'
const bot = new RanditBot({
    actionSpace: actions,
    payoutAmount,
    payoutChanceBounds,
    numberOfMoves
});
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
  bot.game.resetGame(gameId)
})

test('Bot does not accept a guess unless the game is started', () => {
  const guess = actions[0]
  const text = `<@TESTID> guess ${guess}`

  bot._handleMessage({ text, user, channel })

  expect(bot.sendNotStartedMessage).toBeCalledWith(user, channel)
})

test('Bot starts game for user and accepts guesses', () => {
  const guess = actions[0]

  bot._handleMessage({ text: '<@TESTID> start', user, channel })
  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user, channel })

  expect(bot.sendStartMessage).toBeCalledWith(user, channel, { actions })
  expect(bot.sendGuessMessage.mock.calls[0][0]).toBe(user)
  expect(bot.sendGuessMessage.mock.calls[0][1]).toBe(channel)
  expect(bot.sendGuessMessage.mock.calls[0][2].guess).toBe(guess)
  expect(bot.sendGuessMessage.mock.calls[0][2].moves).toBe(numberOfMoves - 1)
  expect(bot.sendNotStartedMessage).toHaveBeenCalledTimes(0)
})

test('Tests are reseting state', () => {
  const state1 = bot.game.getState(gameId)
  expect(state1).toBeUndefined()

  bot._handleMessage({ text: '<@TESTID> start', user, channel })

  const state2 = bot.game.getState(gameId)
  expect(state2).toBeDefined()
})


test('Bot does not accept an invalid guess', () => {
  const guess = 'DEFINITELY_NEVER_USE_THIS_AS_A_POSSIBLE_GUESS'
  const text = `<@TESTID> guess ${guess}`

  bot._handleMessage({ text: '<@TESTID> start', user, channel })
  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user, channel })

  expect(bot.sendStartMessage).toBeCalledWith(user, channel, { actions })
  expect(bot.sendNotAGuessMessage).toBeCalledWith(user, channel, { actions })
})

test('Bot ends game after correct number of moves', () => {
  const guess = actions[0]
  const text = `<@TESTID> guess ${guess}`

  bot._handleMessage({ text: '<@TESTID> start', user })
  let currentGuess = numberOfMoves
  while (currentGuess !== 0) {
    bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user })
    currentGuess -= 1
  }

  expect(bot.sendGameOverMessage).toHaveBeenCalled()
})

test('Bot tracks two different games in different channels', () => {
  const guess = actions[0]
  const channel1 = 'BOTSTUFF'
  const channel2 = 'SECRETBOTSTUFF'

  bot._handleMessage({ text: '<@TESTID> start', user, channel: channel1 })
  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user, channel: channel1 })

  bot._handleMessage({ text: `<@TESTID> guess ${guess}`, user, channel: channel2 })
  expect(bot.sendNotStartedMessage).toBeCalledWith(user, channel2)
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

