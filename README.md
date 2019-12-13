# Channel Naming Slack App Template


> :sparkles: *Updated October 2018: As we have introduced some new features, this tutorial and the code samples have been updated! All the changes from the previous version of this example, read the [DIFF.md](DIFF.md)*


---

An example app that helps enforce channel naming conventions.

![channel-naming](https://user-images.githubusercontent.com/700173/27057518-6b4a6d64-4f81-11e7-853c-702c803a95ee.gif)
*(The GIF image is outdated, however, the functionality of this sample app reminds the same! 🙇‍♀️)*

## Setup

### 1. Remix this Glitch repo
[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-channel-naming-blueprint)

### 2. Create a Slack app

1. Create an app at [https://api.slack.com/apps](https://api.slack.com/apps)
1. At **Bot Users**, add a new bot user.
1. Click on **OAuth & Permissions** and select the following scopes: `chat:write`, `channels:read`
1. Enable the interactive messages (See below *Enable Interactive Messages*)
1. Enable events (See below *Enable the Events API*)
1. Click 'Save Changes' and install the app to all channels (You should get an OAuth access token after the installation

#### Enable Interactive Messages
1. Click on **Interactive Components** and enable the feature.
1. Set the Request URL to your server URL + `/interactions`

If you did "Remix" on Glitch, it auto-generate a new URL with two random words, so your Request URL should be like: `https://fancy-feast.glitch.me/command`. 

#### Enable the Events API
1. Click on **Events Subscriptions** and enable events.
1. Set the Request URL to your server (*e.g.* `https://yourname.ngrok.com`) or Glitch URL + `/events`
1. On the same page, scroll down to *Subscribe to Bot Events* and subscribe to the `channel_created` and `channel_rename` events.


## Run this App

Set Environment Variables and run:

1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_TOKEN`: Your app's `xoxb-` token (available on the Install App page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally, run the app (`npm start`). Or if you're using Glitch, it automatically starts the app.

1. On Slack client, create a new channel
