const http = require('http');
const { RanditBot } = require('./bots/randit_bot')

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
const PAYOUT_CHANCE_BOUNDS = [10, 90]
const NUMBER_OF_MOVES = 25
const PAYOUT_AMOUNT = 100

new RanditBot({
  actionSpace: ACTION_SPACE,
  payoutAmount: PAYOUT_AMOUNT,
  payoutChanceBounds: PAYOUT_CHANCE_BOUNDS,
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
