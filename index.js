var app = require('./app')
var SlackBot = require('./slack_bot')


class MyBot extends SlackBot {
  handleMessage(message) {
    console.log(message)
  }
}

const bot = new MyBot()

app.listen(app.get('port'), function() {
  console.log('the best bot ever is live', app.get('port'))
})
