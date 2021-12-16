type ResponsesType = {
	[match: string]: string
}

const responses: ResponsesType = {
	benjamin: 'Hello Benjamin',
	amy: 'Hello Amy',
	happy: 'I am glad',
}

export const response = (matches: string[] | [string, number][]): string => {
	let response = ''
	for (let word in matches) {
		if (responses[word.toLowerCase()])
			response = responses[word.toLowerCase()]
	}
	return response
}
