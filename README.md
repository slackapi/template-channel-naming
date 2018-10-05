# Channel Naming Slack App Template


> :sparkles: *Updated October 2018: As we have introduced some new features, this tutorial and the code samples have been updated! All the changes from the previous version of this example, read the [DIFF.md](DIFF.md)*


---

An example app that helps enforce channel naming conventions.

![channel-naming](https://user-images.githubusercontent.com/700173/27057518-6b4a6d64-4f81-11e7-853c-702c803a95ee.gif)

## Setup

#### Create a Slack app

1. Create an app at (https://api.slack.com/apps)[https://api.slack.com/apps]
1. At **Bot Users**, add a new bot user.
1. Click on **OAuth & Permissions** and add the following scopes: 
    * `channels:read` 
    * `chat:write:bot` 
1. Enable the interactive messages (See below *Enable Interactive Messages*)
1. Click 'Save Changes' and install the app to all channels (You should get an OAuth access token after the installation

#### Run locally or [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint)
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint
1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_TOKEN`: Your app's `xoxb-` token (available on the Install App page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally:
    * Start the app (`npm start`)
1. Enable the events (See below *Enable the Events API*)

#### Enable the Events API
1. Click on **Events Subscriptions** and enable events.
1. Set the Request URL to your server (*e.g.* `https://yourname.ngrok.com`) or Glitch URL + `/events`
1. On the same page, scroll down to *Subscribe to Bot Events* and subscribe to the `channel_created` and `channel_rename` events.


#### Enable Interactive Messages
1. Click on **Interactive Components** and enable the feature.
1. Set the Request URL to your server URL + `/interactions`

#### In Slack

1. Create a new channel
