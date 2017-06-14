require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const channelTemplate = require('./channel_template');
const notifier = require('./notifier');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h2>The Channel Naming app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your' +
  ' environment variables.</p>');
});

/*
 * Endpoint to receive events from Slack's Events API.
 * Handles:
 *   - url_verification: Returns challenge token sent when present.
 *   - event_callback: Confirm verification token & handle `channel_create`
 *     and `channel_rename` events.
 */
app.post('/events', (req, res) => {
  switch (req.body.type) {
    case 'url_verification': {
      res.status(200).send({ challenge: req.body.challenge });
      break;
    }

    case 'event_callback': {
      if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        res.send('');
        const event = req.body.event;
        if (event.type === 'channel_created' || event.type === 'channel_rename') {
          const channel = event.channel;
          channelTemplate.findOrNotify(channel);
        }
      } else { res.sendStatus(500); }
      break;
    }
    default: res.sendStatus(500);
  }
});

/*
 * Endpoint to receive events from interactive message on Slack. Checks the
 * verification token before continuing.
 * Handles:
 *   - `template_create`: User chooses to either add a new template or select a
 *      pre-existing one.
 *   - `template_channel`: User has chosen to create a new template and is now
 *      selecting a parent channel.
 */
app.post('/interactive-message', (req, res) => {
  const body = JSON.parse(req.body.payload);
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    switch (body.callback_id) {
      case 'template_create': {
        res.send('');
        const prefix = body.actions[0].name;
        const action = body.actions[0].value;

        if (action && action === 'add') {
          // User wants to add a new template
          channelTemplate.create(prefix, body.channel, body.response_url);
        } else if (action && action === 'cancel') {
          // User has cancelled channel template creation
          channelTemplate.cancel(body.response_url);
        } else if (body.actions[0].selected_options) {
          // User has selected an existing template
          const template = body.actions[0].selected_options[0].value;
          notifier.sendRename(prefix, template, body.channel.name, body.response_url);
        }
        break;
      }
      case 'template_channel': {
        res.send('');
        const action = body.actions[0];
        const parentChannel = action.selected_options[0].value;
        const templateName = action.name;

        channelTemplate.addParent(templateName, parentChannel, body.channel, body.response_url);
        break;
      }
      default: res.sendStatus(500);
    }
  } else { res.sendStatus(500); }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
