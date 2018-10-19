A Slack Bot
-----------

## Setup

To install necessary dependencies run:

    $ yarn install

A .env file should be created with the following values:

1. `TOKEN` -- the token for the bot, from Slack
1. `SLACK_CHANNEL` -- the name of the channel for the bot to join

## Running the bot

You can run the bot with one of the included `yarn` commands:

* `yarn start` -- this command will start the bot, which will connect to slack with the token and channel specified.
* `yarn repl` -- the command will start the bot and start a node repl with the bot available in the `bot` variable. You can manually send messages with `bot.sendMessage('my message')`

## Replying to messages

You can change the `handleMessage` method in `index.js` to reply to a message in any way you want. The incoming message has a couple useful attributes. An example message:

```
{
  type: 'message',
  user: 'U0B237ZQ4',
  text: 'I sense a human behind the curtain',
  client_msg_id: 'c59b1d38-88b7-4f45-99a0-3b36398f1019',
  team: 'T02HFLGRQ',
  channel: 'CDHGVMN3R',
  event_ts: '1539910276.000100',
  ts: '1539910276.000100'
}
```

You can use [`this.connection.rtm.datastore`](https://github.com/slackapi/node-slack-sdk/blob/7c192744d49e57938513869365836afca8efeae6/docs/_reference/SlackMemoryDataStore.md) to get user/channel information from an id.
