/* eslint-disable camelcase */
import * as functions from 'firebase-functions'

import { WebClient } from '@slack/web-api'
import { verifyRequestSignature } from '@slack/events-api'

const bot = new WebClient(functions.config().slack.token)

import { PubSub } from '@google-cloud/pubsub'
const pubSubClient = new PubSub()

import type { EventType } from '../types/events'
import type { InteractionPayload } from '../types/interactions'

//Challenge
// Request from Slack
// const { challenge } = req.body

// Response from You
// res.send({ challenge })
// console.log(req.body)

export const slashCommand = functions.https.onRequest(async (req, res) => {
	verifyWebhook(req)

	const data = JSON.stringify(req.body)
	const dataBuffer = Buffer.from(data)

	await pubSubClient
		.topic('slash-command-received')
		.publishMessage({ data: dataBuffer })

	res.status(200).send()
})

export const sendModal = functions.pubsub
	.topic('slash-command-received')
	.onPublish(async (message) => {
		const msg = message.json

		try {
			await bot.views.open({
				token: bot.token,
				trigger_id: msg.trigger_id,
				view: {
					title: { type: 'plain_text', text: 'modal' },
					type: 'modal',
					blocks: [],
				},
			})
		} catch (error) {
			console.error(error)
		}
	})

export const interaction = functions.https.onRequest(async (req, res) => {
	const payload: InteractionPayload = JSON.parse(req.body.payload)

	const data = JSON.stringify(payload)
	const dataBuffer = Buffer.from(data)

	if (payload.view.callback_id) {
		await pubSubClient
			.topic(payload.view.callback_id)
			.publishMessage({ data: dataBuffer })
	}
	res.status(200).send()
})

export const events = functions.https.onRequest(async (req, res) => {
	const eventType: EventType = req.body.type

	const data = JSON.stringify(req.body)
	const dataBuffer = Buffer.from(data)

	await pubSubClient
		.topic(`event_${eventType}`)
		.publishMessage({ data: dataBuffer })

	res.status(200).send()
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
