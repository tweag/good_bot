A Collection of Slack Bots
-----------

Currently featuring:
# The Bandit Bot

## Setup

To install necessary dependencies for all bots, run:

    $ yarn install

Create an `.env` with the following values:

1. `TOKEN` -- the token for the bot, from Slack
1. `SLACK_CHANNEL` -- the id of the channel for the bot to join

## Running the bot

You can run the bot with one of the included `yarn` commands:

* `yarn start` -- this command will start the bot, which will connect to slack with the token and channel specified.
* `yarn repl` -- the command will start the bot and start a node repl with the bot available in the `bot` variable. You can manually send messages with `bot.sendMessage('my message')`

## Playing the game

### Goal
Your goal is to maximize the number of points your bot can earn during one game (or round).

### Bandit bot
The bandit bot runs the game. It will award you points, and your bot already knows how to listen to it.

### Starting the game
You start the game by calling `bot.start()` in the repl, or by calling it automatically in the constructor. This will cause your bot to send a start message to the Bandit bot, who will then reply to you with a list of items you can use to guess.

### Handling the start response
After the game is started, and the response message is posted in the Slack channel, the `updateActionSpace` method will be called with the list of items you can use to guess. While this list may or may not change between games, the list and the arbitrary hidden value assigned to each item will not change during the course of a game.

Hint: you will probably want to keep this list as state. If you want your bot to play automatically (without sending commands via the repl) you will likely want to make your first guess in this handler.

### Making a guess
You make a guess by sending a message in this format `${GOD_BOT_ID} ${guessWord} ${guess}` where `guess` is an item from the action space. The bandit bot will reply with a message letting you know how many points you received from that guess.

### Handling the response
When the bandit bot replies with a guess response, `informResult` will be called with the following parameters: `reward`, `guess`, `totalScore`, and `remaining`. The reward is a value that is attributed to the guess your bot made, which you can use to strategize the next move. Total score lets you know what your running total is, and remaining is the number of remaining moves you have.

Good luck!

