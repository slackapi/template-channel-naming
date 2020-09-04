const qs = require('querystring');
const axios = require('axios');
const JsonDB = require('node-json-db');

const templatesDB = new JsonDB('templates', true, false);

const apiUrl = 'https://slack.com/api';

const sendMessage = (message, url) => {
    const postURL = url || `${apiUrl}/chat.postMessage`;
    const params = url ? message : qs.stringify(message);
    const postMessage = axios.post(postURL, params);
    postMessage.then().catch();
};

const sendNotFound = (channelId, templateName) => {
    const templates = Object.keys(templatesDB.getData('/'));
    const options = [];
    if (templates.length > 0) {
        templates.forEach((template) => options.push({ text: { type: 'plain_text', text: template }, value: template }));
    }

    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `No matching channel template found for ${templateName}. Do you want to add it or use an existing template?`,
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    style: 'primary',
                    text: {
                        type: 'plain_text',
                        text: 'Add',
                    },
                    value: templateName,
                    action_id: 'template_add',
                },
                {
                    type: 'static_select',
                    action_id: `rename_${templateName}`,
                    options,
                },
                {
                    type: 'button',
                    style: 'danger',
                    text: {
                        type: 'plain_text',
                        text: 'Cancel',
                    },
                    value: 'cancel',
                    action_id: 'template_cancel',
                },
            ],
        },
    ];

    const body = {
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: channelId,
        blocks: JSON.stringify(blocks),
    };

    sendMessage(body);
};

const sendSetParent = (channelId, templateName) => {
    const blocks2 = [
        {
            type: 'section',
            text: {
                type: 'plain_text',
                text: 'What is the primary channel for the template?',
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'channels_select',
                    action_id: `parent_${templateName}`,
                },
            ],
        },
    ];

    const body = {
        token: process.env.SLACK_ACCESS_TOKEN,
        channel: channelId,
        text: 'What is the primary channel for the template?',
        blocks: JSON.stringify(blocks2),
    };
    sendMessage(body);
};

const getChannelInfo = (channelId) => {
    const body = { token: process.env.SLACK_ACCESS_TOKEN, channel: channelId };
    return axios.post(`${apiUrl}/channels.info`, qs.stringify(body));
};

const sendParentNotification = (channel, parentChannelId, templateName) => {
    getChannelInfo(channel.id).then(() => {
        const body = {
            token: process.env.SLACK_ACCESS_TOKEN,
            channel: parentChannelId,
            text: `A new *${templateName}-* channel has been created! #${channel.name}`,
        };
        sendMessage(body);
    });
};

const sendRename = (currentPrefix, newPrefix, channelName, responseURL) => {
    const newName = channelName.replace(currentPrefix, newPrefix);
    const body = { text: `Please rename channel to *${newName}* to apply the template.` };
    // Note: The only people who can rename a channel are Team Admins, or the person that
    // originally created the channel. If you want to programmatically rename the channel,
    // you need to enable a user token on behalf of the admin
    sendMessage(body, responseURL);
};


module.exports = {
    sendMessage, sendSetParent, sendParentNotification, sendNotFound, sendRename,
};
