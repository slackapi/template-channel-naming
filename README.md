# Channel Naming Slack App Template

An example app that helps enforce channel naming conventions.

![channel-naming](https://user-images.githubusercontent.com/700173/27057518-6b4a6d64-4f81-11e7-853c-702c803a95ee.gif)

## Setup

#### Create a Slack app

1. Create an app at api.slack.com/apps
1. Click on `OAuth & Permissions`
1. Add the `channels:read` and `chat:write:bot` permissions
1. Click on `Install App` in the sidebar
1. Install the app and copy the `xoxp-` token

#### Run locally or [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint)
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint
1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_TOKEN`: Your app's `xoxp-` token (available on the Install App page)
    * `PORT`: The port that you want to run the web server on
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally:
    1. Start the app (`npm start`)
    1. In another windown, start ngrok on the same port as your webserver (`ngrok http $PORT`)

#### Enable the Events API
1. Go back to the app settings and click on Events Subscriptions
1. Set the Request URL to your ngrok or Glitch URL + /events
1. On the same page, subscribe to the `channel_created` and `channel_rename` events

#### Enable Interactive Messages

1. In the app settings, click on Interactive Messages
1. Set the Request URL to your ngrok or Glitch URL + /interactive-message

#### In Slack

1. Create a new channel
