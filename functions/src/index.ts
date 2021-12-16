/* eslint-disable camelcase */
import * as functions from 'firebase-functions'

import { WebClient } from '@slack/web-api'
import { verifyRequestSignature } from '@slack/events-api'

const bot = new WebClient(functions.config().slack.token)

import { PubSub } from '@google-cloud/pubsub'
const pubSubClient = new PubSub()

import type { EventType, MessageEventType } from '../types/events'
import { fuzzySearch } from './fuzzySearch'
import { response } from './responses'

//Challenge
// Request from Slack
// const { challenge } = req.body

// Response from You
// res.send({ challenge })
// console.log(req.body)

export const events = functions.https.onRequest(async (req, res) => {
	verifyWebhook(req)

	const eventType: EventType = req.body.type

	const data = JSON.stringify(req.body)
	const dataBuffer = Buffer.from(data)

	await pubSubClient
		.topic(`event-${eventType}`)
		.publishMessage({ data: dataBuffer })

	res.status(200).send()
})

export const messageResponse = functions.pubsub
	.topic('event-message')
	.onPublish(async (message) => {
		const payload: MessageEventType = message.json

		const matches = fuzzySearch(payload.text)
		const responseText = response(matches)

		await bot.chat.postMessage({
			token: bot.token,
			channel: payload.user,
			text: responseText,
		})
	})

const verifyWebhook = (req: functions.https.Request) => {
	const signature = {
		signingSecret: functions.config().slack.signing_secret || '',
		requestSignature: req.headers['x-slack-signature'] as string,
		requestTimestamp: parseInt(
			req.headers['x-slack-request-timestamp'] as string
		),
		body: req.rawBody as any,
	}

	verifyRequestSignature(signature)
}
