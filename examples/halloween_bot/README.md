A Halloween Experiement with Bots
-----------

## Setup

To install necessary dependencies run the install step in the root of the repo
```
yarn install
```

Then, change into the example directory to run the rest of the commands
```
cd examples/halloween_bot/
```

Create an `.env` with the following values:

1. `TOKEN` -- the token for the bot, from Slack
1. `SLACK_CHANNEL` -- the id of the channel for the bot to join

## Running the bot

You can run the bot with one of the included `yarn` commands:

* `yarn start` -- this command will start the bot, which will connect to slack with the token and channel specified.
* `yarn repl` -- the command will start the bot and start a node repl with the bot available in the `bot` variable. You can manually send messages with `bot.sendMessage('my message')`


## Alive or Dead

Your bot starts with the alive state. When a message is received in the configured channel, `aliveResponse` will be called with the message.

When the halloween bot first booted up, it will randomly select a weakness word. When the word is said in the configured channel, the bot will automatically call `dyingWords()`.

Afterwards, your bot has a dead state. When a message is received in the configured channel, `deadResponse` will be called with the message.

## Sending messages

Your bot has a method called `send` that you can call to send a text message in the configured channel.

## Receiving messages

When a message comes in (alive or dead) it will look something like this. This is subject to changes as the Slack message format evolves. For more info see https://api.slack.com/events/message

```
{
  bot_id: '<botid>',
  suppress_notification: false,
  type: 'message',
  text: 'hello',
  user: '<userwhosentmessageid>',
  team: '<slackteamid>',
  bot_profile: {
    id: '<botid>',
    deleted: false,
    name: 'bot',
    updated: 1595012383,
    app_id: '<appid>',
    icons: {
      image_36: 'https://a.slack-edge.com/80588/img/services/bots_36.png',
      image_48: 'https://a.slack-edge.com/80588/img/plugins/bot/service_48.png',
      image_72: 'https://a.slack-edge.com/80588/img/services/bots_72.png'
    },
    team_id: '<slackteamid>'
  },
  source_team: '<slackteamid>',
  user_team: '<slackteamid>',
  channel: '<channelid>',
  event_ts: '1595014649.005100',
  ts: '1595014649.005100'
}
```
