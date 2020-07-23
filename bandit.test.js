const { BanditBot, shuffle, linearDistribution } = require('./bandit')

jest.mock('./connection')

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

