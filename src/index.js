'use strict';

require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const signature = require('./verifySignature');
const channelTemplate = require('./channel_template');
const notifier = require('./notifier');

const apiUrl = 'https://slack.com/api';

const app = express();


/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

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
      res.send({ challenge: req.body.challenge });
      break;
    }

    case 'event_callback': {
      // Verify the signing secret
      if (!signature.isVerified(req)) {
        res.sendStatus(404);
        return;
      } else {
        const { type, channel } = req.body.event;

        if (type === 'channel_created' || type === 'channel_rename') {
          channelTemplate.findOrNotify(channel);
        }
      }
      break;
    }
    default: res.sendStatus(404);
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
app.post('/interactions', (req, res) => {
  const body = JSON.parse(req.body.payload);

  if (!signature.isVerified(req)) {
    res.sendStatus(404);
    return;
  } else {
    const { channel, callback_id, actions, response_url } = JSON.parse(req.body.payload);

    switch (callback_id) {
      case 'template_create': {
        res.send('');
        const prefix = actions[0].name;
        const action = actions[0].value;

        if (action && action === 'add') {
          // User wants to add a new template
          channelTemplate.create(prefix, channel, response_url);
        } else if (action && action === 'cancel') {
          // User has cancelled channel template creation
          channelTemplate.cancel(response_url);
        } else if (actions[0].selected_options) {
          // User has selected an existing template
          const template = actions[0].selected_options[0].value;
          notifier.sendRename(prefix, template, channel.name, response_url);
        }
        break;
      }
      case 'template_channel': {
        res.send('');
        const action = actions[0];
        const parentChannel = action.selected_options[0].value;
        const templateName = action.name;

        channelTemplate.addParent(templateName, parentChannel, channel, response_url);
        break;
      }
      default: res.sendStatus(404);
    }
  }
});


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});