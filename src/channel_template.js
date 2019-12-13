const JsonDB = require('node-json-db');
const notifier = require('./notifier.js');

const REGEX = /[^-]*/i;
const templatesDB = new JsonDB('templates', true, false);

const findOrNotify = (channel) => {
  const match = REGEX.exec(channel.name);
  const templateName = match[0];
  let data = false;

  // Search database for template
  try { data = templatesDB.getData(`/${templateName}`); } catch (error) {
    console.log(`${templateName} not found`);
  }

  if (!data) {
    // Notify user that no template found
    notifier.sendNotFound(channel.id, templateName);
  } else {
    // Add channel to template's list of channels if it's not there already
    if (!data.channels.includes(channel.id)) {
      templatesDB.push(`/${templateName}/channels[]`, channel.id, true);
    }

    if (data.parent) {
      // Send notification to parent channel if one exists
      notifier.sendParentNotification(channel, data.parent, templateName);
    } else {
      // Ask the user to set a parent channel if one doesn't exist
      notifier.sendSetParent(channel.id, templateName);
    }
  }
};

const create = (templateName, channel, responseURL) => {
  // Store the template and the channel it was created in
  templatesDB.push(`/${templateName}/channels[0]`, channel.id, true);

  const message = { text: `:white_check_mark: Template \`${templateName}\` created!` };

  // Update initial notification after template created. Ask user to set parent.
  notifier.sendMessage(message, responseURL);
  notifier.sendSetParent(channel.id, templateName);
};

const cancel = (responseURL) => {
  const message = { text: 'No template being created for this channel :weary:' };

  notifier.sendMessage(message, responseURL);
};

const addParent = (templateName, parentChannel, channel, responseURL) => {
  // Add the parent channel to the template
  templatesDB.push(`/${templateName}/parent`, parentChannel, true);

  const message = { text: `:white_check_mark: Parent channel set to <#${parentChannel}>\n
  All new channels with the \`${templateName}\` prefix will posted there.` };

  // Update initial notification after template created. Send notification to parent channel
  notifier.sendMessage(message, responseURL);
  notifier.sendParentNotification(channel, parentChannel, templateName);
};

module.exports = { findOrNotify, create, cancel, addParent };