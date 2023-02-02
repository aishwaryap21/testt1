const ngrok = require('ngrok');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Slack API token 
const SLACK_APP_TOKEN = 'xoxb-4541772737956-4604989680163-V54LMEwzmk0ufw4FliOV0Uve';

// Start ngrok tunnel
ngrok.connect(3000).then(ngrokUrl => {
  console.log(`NGROK URL: ${ngrokUrl}`);

  // Initialize express app
  const app = express();
  app.use(bodyParser.json());

  // Endpoint for Slack Events API to send events to
  app.post('/slack/events', (req, res) => {
    // Verify that the request is coming from Slack
    if (!SLACK_APP_TOKEN || req.body.token !== SLACK_APP_TOKEN) {
      return res.status(401).send('Unauthorized');
    }

    const event = req.body.event;
    if (event.type === 'message' && event.subtype !== 'bot_message') {
      const message = event.text;
      const sender = event.user;

      // Send message and sender's name to the webhook endpoint
      axios.post('https://api.jetabe.com/fileModify/readJson', {
        sender,
        message,
      })
        .then(() => {
          console.log(`Sent message from ${sender} to webhook endpoint: ${message}`);
        })
        .catch(error => {
          console.error(`Error sending message to webhook endpoint: ${error}`);
        });
    }

    // Return a success response to Slack
    res.send('');
  });

  // Start the express app
  app.listen(3000, () => {
    console.log('Listening on http://localhost:3000');
  });
});
