require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const persephonySDK = require('@persephony/sdk')

const app = express()
app.use(bodyParser.json())
// Where your app is hosted ex. www.myapp.com
const host = process.env.HOST
const port = process.env.PORT || 3000
// your Persephony API key (available in the Dashboard) - be sure to set up environment variables to store these values
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const persephony = persephonySDK(accountId, authToken)
const applicationId = process.env.APPLICATION_ID

// Invoke create method to initiate the asynchronous outdial request
persephony.api.calls.create(to, from, applicationId).catch(err => {/* Handle Errors */ })

// Handles incoming calls. Set with 'Call Connect URL' in App Config
app.post('/incomingCall', (req, res) => {
  // Create PerCL say script
  const say = persephony.percl.say('Hello. Please leave a message after the beep, then press one or hangup.')
  const options = {
    playBeep: true,
    finishOnKey: '1'
  }
  // Create PerCL record utterance script
  const record = persephony.percl.recordUtterance(`${host}/finishedRecording`, options)
  const percl = persephony.percl.build(say, record)
  res.status(200).json(percl)
})

app.post('/finishedRecording', (req, res) => {
  const recordingResponse = req.body
  const say = persephony.percl.say('This is what you have recorded')
  const play = persephony.percl.play(recordingResponse.recordingUrl)
  const goodbye = persephony.percl.say('Goodbye')
  const percl = persephony.percl.build(say, play)
  res.status(200).json(percl)
})

// Specify this route with 'Status Callback URL' in App Config
app.post('/status', (req, res) => {
  // handle status changes
  res.status(200)
})

app.listen(port, () => {
  console.log(`started the server on port ${port}`)
})