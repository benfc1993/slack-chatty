export interface InteractionPayload {
	type: string
	team: { id: string; domain: string }
	user: {
		id: string
		username: string
		name: string
		team_id: string
	}
	api_app_id: string
	token: string
	trigger_id: string
	view: {
		id: string
		type: string
		title: { [key: string]: any }
		submit: { [key: string]: any }
		blocks: []
		private_metadata: string
		callback_id: string
		state: {
			values: {
				chat_type: {
					[key: string]: {
						type: string
						selected_option: {
							text: {
								type: string
								text: string
								emoji: boolean
							}
							value: string
						}
					}
				}
			}
		}
		hash: string
		response_urls: [
			{
				block_id: string
				action_id: string
				channel_id: string
				response_url: string
			}
		]
	}
	response_urls: []
	is_enterprise_install: boolean
	enterprise: null
}
