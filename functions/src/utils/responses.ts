type ResponsesType = {
	[match: string]: string
}

export const responses: ResponsesType = {
	benjamin: 'Hello Benjamin',
	amy: 'Hello Amy',
	happy: 'I am glad',
}

export const response = (matches: string[] | [string, number][]): string => {
	let response = 'Hello'

	if (typeof matches[0] === 'string') {
		for (let word of matches) {
			if (Object.keys(responses).includes(String(word).toLowerCase()))
				response = responses[String(word).toLowerCase()]
		}
	} else {
		for (let match of matches) {
			if (Object.keys(responses).includes(match[0].toLowerCase()))
				response = responses[match[0].toLowerCase()]
		}
	}
	return response
}
