const { BanditBot } = require('./bots/bandit_bot')

const ACTION_SPACE = [
  'attack',
  'hack',
  'sack',
  'sidetrack',
  'pack',
  'smack',
  'whack',
  'hijack',
]
const REWARD_BOUNDS = [-100, 100]
const NUMBER_OF_MOVES = 25

new BanditBot({
  actionSpace: ACTION_SPACE,
  rewardBounds: REWARD_BOUNDS,
  numberOfMoves: NUMBER_OF_MOVES,
});

