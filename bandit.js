const http = require('http');
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

// Heroku needs us to listen on a port in order to keep the service running
const port = process.env.PORT || 3000
const server = http.createServer((_, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  response.end('THIS BOT IS A GOOD BOT')
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
