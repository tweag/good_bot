A Slack Bot
-----------

## Setup

To install necessary dependencies run:

    $ yarn install

A .env file should be created with the following values:

1. `TOKEN` -- the token for the bot, from Slack
1. `SLACK_CHANNEL` -- the id of the channel for the bot to join

## Running the bot

You can run the bot with one of the included `yarn` commands:

* `yarn start` -- this command will start the bot, which will connect to slack with the token and channel specified.
* `yarn repl` -- the command will start the bot and start a node repl with the bot available in the `bot` variable. You can manually send messages with `bot.sendMessage('my message')`

## Replying to messages

You can change the `handleMessage` method in `index.js` to reply to a message in any way you want. The incoming message has a couple useful attributes. An example message:

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
