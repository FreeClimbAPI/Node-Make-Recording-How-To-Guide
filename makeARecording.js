require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const freeclimbSDK = require('@freeclimb/sdk')
const { PerclScript, Say, RecordUtterance, Play, Hangup } = require('@freeclimb/sdk')

const app = express()
app.use(bodyParser.json())
// Where your app is hosted ex. www.myapp.com
const host = process.env.HOST
const port = process.env.PORT || 80
// your freeclimb API key (available in the Dashboard) - be sure to set up environment variables to store these values
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const to = 'YOUR_TO_NUMBER'
const from = 'YOUR_FROM_NUMBER'
const applicationId = process.env.APPLICATION_ID
const configuration = freeclimbSDK.createConfiguration({ accountId, apiKey })
const freeclimb = new freeclimbSDK.DefaultApi(configuration)

freeclimb.makeACall({ to, from, applicationId, callConnectUrl: `${host}/incomingCall` }).catch(err => { console.log(err) })

app.post('/incomingCall', (req, res) => {
  res.status(200).json(new PerclScript({
    commands: [
      new Say({ text: "Hello. Please leave a message after the beep, then press one." }),
      new RecordUtterance({
        playBeep: true,
        finishOnKey: '1',
        actionUrl: `${host}/finishedRecording`
      })
    ]
  }).build())
})

app.post('/finishedRecording', (req, res) => {
  res.status(200).json(new PerclScript({
    commands: [
      new Say({ text: "This is what you have recorded" }),
      new Play({ file: req.body.recordingUrl }),
      new Hangup({})
    ]
  }).build())
})

// Specify this route with 'Status Callback URL' in App Config
app.post('/status', (req, res) => {
  // handle status changes
  res.status(200)
})

app.listen(port, () => {
  console.log(`started the server on port ${port}`)
})