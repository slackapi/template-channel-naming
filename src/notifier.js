const qs = require('querystring');
const axios = require('axios');
const JsonDB = require('node-json-db');

const templatesDB = new JsonDB('templates', true, false);

const postResult = (result) => { console.log(result.data); };

const sendMessage = (message, url) => {
  const postURL = url || 'https://slack.com/api/chat.postMessage';
  const params = url ? message : qs.stringify(message);
  const postMessage = axios.post(postURL, params);
  postMessage.then(postResult).catch(postResult);
};

const sendNotFound = (channelId, templateName) => {
  const templates = Object.keys(templatesDB.getData('/'));
  const options = [];
  if (templates.length > 0) {
    templates.forEach(template => options.push({ text: template, value: template }));
  }

  const body = {
    token: process.env.SLACK_TOKEN,
    channel: channelId,
    text: `No matching channel template found for \`${templateName}\`. Do you want to add it or use an existing template?`,
    attachments: JSON.stringify([{
      text: '',
      callback_id: 'template_create',
      actions: [{
        name: templateName,
        text: 'Add',
        type: 'button',
        value: 'add',
        style: 'primary',
      },
      {
        name: templateName,
        text: 'Select existing template',
        type: 'select',
        options,
      },
      {
        name: templateName,
        text: 'Cancel',
        type: 'button',
        value: 'cancel',
        style: 'danger',
      }],
    }]),
  };

  sendMessage(body);
};

const sendSetParent = (channelId, templateName) => {
  const body = {
    token: process.env.SLACK_TOKEN,
    channel: channelId,
    text: 'What is the primary channel for the template?',
    attachments: JSON.stringify([{
      fallback: 'Upgrade your Slack client to use messages like these.',
      attachment_type: 'default',
      text: '',
      callback_id: 'template_channel',
      actions: [
        {
          name: templateName,
          text: 'Select the primary channel for the template',
          type: 'select',
          data_source: 'channels',
        }],
    }]),
  };

  sendMessage(body);
};

const getChannelInfo = (channelId) => {
  const body = { token: process.env.SLACK_TOKEN, channel: channelId };
  return axios.post('https://slack.com/api/channels.info', qs.stringify(body));
};

const sendParentNotification = (channel, parentChannelId, templateName) => {
  getChannelInfo(channel.id).then((result) => {
    const body = {
      token: process.env.TOKEN,
      channel: parentChannelId,
      text: `A new ${templateName} channel has been created!`,
      attachments: JSON.stringify([{
        fallback: 'Upgrade your Slack client to use messages like these.',
        title: `<#${channel.id}>`,
        text: `Purpose: ${result.data.channel.purpose.value || 'Not set'}`,
      }]),
    };
    sendMessage(body);
  });
};

const sendRename = (currentPrefix, newPrefix, channelName, responseURL) => {
  const newName = channelName.replace(currentPrefix, newPrefix);
  const body = { text: `Rename channel to *${newName}* to apply the template.` };
  sendMessage(body, responseURL);
};

module.exports = { sendMessage, sendSetParent, sendParentNotification, sendNotFound, sendRename };
