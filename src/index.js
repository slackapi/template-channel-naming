require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const signature = require('./verifySignature');
const channelTemplate = require('./channel_template');
const notifier = require('./notifier');

// const apiUrl = 'https://slack.com/api';

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

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.get('/', (req, res) => {
    res.send('<h2>The Channel Naming app is running</h2> <p>Follow the'
        + ' instructions in the README to configure the Slack App and your'
        + ' environment variables.</p>');
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
        }
        else {
            // Make sure Slack gets a 200 OK so it won't retry.
            res.sendStatus(200);
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
    // const body = JSON.parse(req.body.payload);

    if (!signature.isVerified(req)) {
        res.sendStatus(404);
    }
    else {
        const { channel, actions, response_url: responseURL } = JSON.parse(req.body.payload);
        const action = actions[0];

        console.log(action);

        if (/parent_/i.test(action.action_id)) { // After "Add", set primary channel for the template
            res.send('');

            const parentChannel = action.selected_channel;
            const templateName = action.action_id.substring(7);

            channelTemplate.addParent(templateName, parentChannel, channel, responseURL);
        }
        else if (/rename_/i.test(action.action_id)) { // Rename channel from the saves prefix- template
            res.send('');

            // User has selected an existing template
            const newPrefix = action.selected_option.value;
            const currentPrefix = action.action_id.substring(7);
            notifier.sendRename(currentPrefix, newPrefix, channel.name, responseURL);
        }
        else if (action.action_id === 'template_add') { // Add the prefix in the template DB
            res.send('');
            const prefix = action.value;

            // User wants to add a new template
            channelTemplate.create(prefix, channel, responseURL);
        }
        else if (action.action_id === 'template_cancel') { // Cancel - do nothing. just send a message.
            res.send('');
            // User has cancelled channel template creation
            channelTemplate.cancel(responseURL);
        }
        else {
            res.sendStatus(404);
        }
    }
});


const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
