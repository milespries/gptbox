import { OPENAI_KEY } from '$env/static/private'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
	runtime: 'edge',
	split: true
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data')
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

		if (!reqMessages) {
			throw new Error('no messages provided')
		}

		let tokenCount = 0

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: `Based on the provided user input JSON, generate a realistic form inputs for the following fields, Business Idea, Problem Solved, and Unique Selling Point . Consider the information about the user's business. Format the output as follows: "business idea *** problem solved *** unique selling point ***". You can not output anything other than the formatted output.` },
			{ role: 'user', content: `{  name: 'My Business Pal',   industry: 'Technology',   target_market: 'Aspiring entrapenuer',   business_idea: '',   problem_solved: '',   selling_point: '',   idea_stage: 'Prototype/MVP' }` },
			{ role: 'assistant', content: `A user-friendly mobile app and web platform for aspiring entrepreneurs *** Streamlines the process of creating and managing business plans, financial projections, and market analysis *** AI-driven personalized guidance and real-time progress tracking for new entrepreneurs ***` },
			...reqMessages
		]

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.85,
			max_tokens: 400,
			stream: true
		}
		//console.log(`${tokenCount} Tokens  ||  ${prompt.length} Characters  ||  ${messages.length}`)

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		})

		if (!chatResponse.ok) {
			const err = await chatResponse.json()
			throw new Error(err)
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}
