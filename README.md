# Channel Naming Slack App Template


> :sparkles: *Updated August 2018: As we have introduced the workspace app (currently in beta), this tutorial and the code samples have been updated using the new token model! All the changes from the previous version of this example, read the [diff.md](diff.md)*

*Learn more about the workspace app at the [Slack API doc](https://api.slack.com/workspace-apps-preview).*

---

An example app that helps enforce channel naming conventions.

![channel-naming](https://user-images.githubusercontent.com/700173/27057518-6b4a6d64-4f81-11e7-853c-702c803a95ee.gif)

## Setup

#### Create a Slack app

1. Create a *workspace app* at (https://api.slack.com/apps?new_app_token=1)[https://api.slack.com/apps?new_app_token=1]
1. Click on `OAuth & Permissions` and add the following scopes: 
    * `channels:read` 
    * `chat:write` 
1. Enable the events (See below *Enable the Events API*)
1. Enable the interactive messages (See below *Enable Interactive Messages*)
1. Click 'Save Changes' and install the app to all channels (You should get an OAuth access token after the installation

#### Run locally or [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint)
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint
1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxa-` token (available on the Install App page)
    * `SLACK_SIGNING_SECRET`: Your app's Verification Token (available on the Basic Information page)
    * `PORT`: The port that you want to run the web server on (Default: 5000)
1. If you're running the app locally:
    * Start the app (`npm start`)

#### Enable the Events API
1. Click on **Events Subscriptions** and enable events.
1. Set the Request URL to your server (*e.g.* `https://yourname.ngrok.com`) or Glitch URL + `/events`
1. On the same page, subscribe to the `channel_created` and `channel_rename` events.


#### Enable Interactive Messages
1. Click on **Interactive Components** and enable the feature.
1. Set the Request URL to your server URL + `/interactions`

#### In Slack

1. Create a new channel
