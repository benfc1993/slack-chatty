import { responses } from './responses'
import { sw } from './stop-words'

const leven = (s: string, t: string) => {
	const rows = s.length + 1
	const cols = t.length + 1
	const distance = new Array(rows).fill(0)
	distance.forEach((r, i) => (distance[i] = new Array(cols).fill(0)))

	let cost = 0

	for (let i = 1; i < rows; i++) {
		for (let k = 1; k < cols; k++) {
			distance[i][0] = i
			distance[0][k] = k
		}
	}
	let col = 0,
		row = 0
	for (col = 1; col < cols; col++) {
		for (row = 1; row < rows; row++) {
			if (s[row - 1] == t[col - 1]) cost = 0
			else cost = 2

			distance[row][col] = Math.min(
				distance[row - 1][col] + 1,
				distance[row][col - 1] + 1,
				distance[row - 1][col - 1] + cost
			)
		}
	}

	let Ratio =
		(s.length + t.length - distance[row - 1][col - 1]) /
		(s.length + t.length)
	return Ratio
}

const leven_arr_to_single = (input: string[], arr: string[]) => {
	let best_ratio = 0
	let best_match = ''

	for (let i = 0; i < input.length; i++) {
		for (let j = 0; j < arr.length; j++) {
			let ratio = leven(input[i], arr[j])
			if (ratio > best_ratio) {
				best_ratio = ratio as number
				best_match = arr[j]
			}
		}
	}
	return best_match
}

const leven_arr_to_dict = (
	input: string[],
	arr: string[],
	withRatios = false
) => {
	let matches: { [word: string]: number } = {}

	for (let i = 0; i < input.length; i++) {
		for (let j = 0; j < arr.length; j++) {
			let ratio = leven(input[i], arr[j])
			if (
				Object.keys(matches).includes(arr[j]) &&
				ratio < matches[arr[j]]
			) {
				continue
			}
			matches[arr[j]] = ratio
		}
	}
	const sorted_matches = Object.entries(matches).sort(
		([k1, v1], [k2, v2]) => v2 - v1
	)
	if (withRatios) return sorted_matches
	return sorted_matches.map(([k, v]) => k)
}

const strings = Object.keys(responses)

export const fuzzySearch = (
	input: string,
	withScores: boolean = false
): string[] | [string, number][] => {
	const input_words = input.split(/\s/).reduce((arr: string[], word) => {
		if (!sw.includes(word.toLowerCase())) arr.push(word)
		return arr
	}, [])

	return leven_arr_to_dict(input_words, strings)
}
