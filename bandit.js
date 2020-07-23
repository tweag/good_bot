require('dotenv').config({silent: true})

var Connection = require('./connection')


class Bandit {
  constructor() {
    this.SLACK_CHANNEL = process.env.SLACK_CHANNEL

    this.connection = new Connection()
    this.connection.listen({
      channel: this.SLACK_CHANNEL,
      callback: this.handleMessage.bind(this),
    })
    this.connection.start().then(this._setBotId)

    this.commands = ["start", "guess"];
    this.state = {};
  }

  _setBotId = (id) => {
    console.log(id)
    this.botId = id
  }

  send(message) {
    this.connection.send({ channel: this.SLACK_CHANNEL, message })
  }

  /**
   * 
   * @param {String} text 
   * @param {Array<String>} words 
   * @returns {Boolean}
   */
  containsAny(text, words) {
    for (let word of words) {
      if (text.includes(word)) {
        return true;
      }
    }

    return false;
  }

  sendNoCommandsMessage(message)
  {
    this.send(`<@${message.user}> Unrecognized command. Available commands are: ${this.commands.join(", ")}`);
  }

  sendStartMessage(message) {
    let options = Object.keys(this.state[message.user].rewards).join(", ");
    this.send(`<@${message.user}> You've started a game.
      \ Your options are ${options}.
      \ Attempt a guess by writing \`<@${this.botId}> guess {option}\`\n
      \ begin ${options}`);
  }

  sendGuessMessage(message) {
    let options = Object.keys(this.state[message.user].rewards);
    let playerState = this.state[message.user];
    let guess = message.text.replace(`<@${this.botId}>`, "");
    guess = guess.replace("guess", "").trim();

    if (this.containsAny(guess, options)) {
      let reward = playerState.rewards[guess];
      playerState.total += reward;

      this.send(`<@${message.user}> You guessed "${guess}".
        \ Reward: ${reward}. 
        \ Total Score: ${playerState.total}. 
        \ Moves Remianing: ${--playerState.moves}\n
        \ reward ${reward}, ${guess}, ${playerState.total}, ${playerState.moves}`)

      if (playerState.moves <= 0) {
        delete this.state[message.user];
        this.send(`<@${message.user}> Game over.
          \ Your score was: ${playerState.total}`);
      }
    }

    else {
      this.send(`<@${message.user}> You didn't take a possible action.
        \ Your options are ${options.join(", ")}.
        \ Attempt a guess by writing \`<@${this.botId}> guess {option}\``);
    }
  }

  generateRewards() {
    let words = ["A", "B", "C", "D", "E"];
    let rewards = {};

    for (let word of words) {
      // Random number between -5..5
      rewards[word] = Math.random() * 10 - 5;
    }

    return rewards;
  }

  handleDirectedMessage(message) {
    let messageContents = message.text.replace(`@<${this.botId}>`, "");

    if (!this.containsAny(messageContents, this.commands))
    {
      this.sendNoCommandsMessage(message);
    }

    else if (this.containsAny(messageContents, ["start"]))
    {
      this.state[message.user] = {
        total: 0,
        moves: 25,
        rewards: this.generateRewards()
      }

      this.sendStartMessage(message);
    }

    else if (this.containsAny(messageContents, ["guess"]))
    {
      if (this.state[message.user]) {
        this.sendGuessMessage(message);
      }

      else {
        this.send(`<@${message.user}> You didn't start a game!
          \ Start a game by writing \`<@${this.botId}> start\``);
      }
    }
  }

  handleMessage(message) {
    // NOTE: Be very careful here. If the botId is not checked for properly
    // it will result in an infinite loop.
    if (message.text.includes(`<@${this.botId}>`) && message.user != this.botId)
    {
      this.handleDirectedMessage(message);
    }
  }
}

new Bandit();
