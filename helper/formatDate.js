
const moment = require('moment');

function formatMessage(username, text){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    };
}

module.exports = formatMessage;

// This function takes in the username and message as arguments, and returns an object containing a formatted time, username, and message. 