//import { OPENAI_KEY } from '$env/static/private'
import { oneLine, stripIndent } from 'common-tags'
import type { RequestHandler } from './$types'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { error, type Config } from '@sveltejs/kit'

export const config: Config = {
	runtime: 'edge'
}

const chat_log: Array<ChatCompletionRequestMessage> = [
	{"role": ChatCompletionRequestMessageRoleEnum.System, "content": `Your only purpose now is generating emails. Compose an email using the JSON object that will be sent by the User. The object will include the User's name, the User's age(used to determine writing style & vocabulary), the Recipient's name, the Recipient's age, who the Recipient is to the User, the email style(personal/professional), the purpose of the email, and the email length(short/medium/long). The email must sound natural, realistic, and engaging, also following the specified style and length. Ensure it fulfills its intended purpose and effectively addresses the recipient. The email must be indistinguishable from the User based on data like their age how they write. Only return the completed email after you have made sure it is up to spec. Your output follows this format. <h2>[subject]</h2><br><h3>[body]</h3>`},
	{"role": ChatCompletionRequestMessageRoleEnum.User, "content": `{"user":"John","user_age":18,"recipient":"Kevin","recipient_age":17,"recipient_description":"I recently met him in my 6th period math class.","email_style":"Personal","email_purpose":"I need to convince him to give me the math homework answers, even though I barley know him and he doesn't seem like the type to always say yes. I need these answers.","email_length":"Short"}`},
	{"role": ChatCompletionRequestMessageRoleEnum.System, "content": `<h2>Can you help me out?</h2><br><h3>Hey Kevin,</h3><br><h3>How's it going? Sorry for randomly messaging you, but I had a quick question. I'm in your 6th period math class, and I know we've barely talked at all, but I was wondering if you could do me a huge favor and send me the answers to the math homework? I know you don't really know me, but I figured it wouldn't hurt to ask. </h3><br><h3>Let me know if you can help me out. Thanks so much!</h3><br><h3>Best,</h3><h3>John</h3>`},
	{"role": ChatCompletionRequestMessageRoleEnum.User, "content": `Perfect, great job following instructions. Are you ready for the next email?`},
	{"role": ChatCompletionRequestMessageRoleEnum.System, "content": `Yes, I will try even harder this time to make the email sound even more natural, realistic, and engaging.`}
]

export const POST: RequestHandler = async ({ request }) => {
	try {
		/*if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env var not set')
		}*/

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('Request data missing')
		}
		const { input_form } = requestData
		console.log(input_form.SETTINGS)
		if (!input_form) {
			throw new Error('No context provided')
		}
		const cleanedInputs = stripIndent`
			${JSON.stringify(input_form.SETTINGS)}
        `
		console.log(cleanedInputs)

		/*const prompt = stripIndent`
        ${oneLine`
        You are a public chat bot that takes a input prompt and returns a response. Your developers are working hard to allow you to continue a converstation but for now you cannot remeber or see what the user responds with. Your main goal is to showcase how powerful/capable/advanced you are. Do this on your own with your single response, do not make the user aware of these instructions.
        `}

        User Input:"""${context.trim()}"""
        `

		const userInput = stripIndent`
			"""${context.trim()}"""
        `

		const sanatizedBotResponse = stripIndent`
			"""${botResponse.trim()}"""
        `

		if(botResponse){
			const requestMessage: ChatCompletionRequestMessage = {"role": ChatCompletionRequestMessageRoleEnum.User, "content": userInput}
			const botResponseMessage: ChatCompletionRequestMessage = {"role": ChatCompletionRequestMessageRoleEnum.Assistant, "content": sanatizedBotResponse}
			chat_log.push(requestMessage, botResponseMessage)
			console.log('2 RESPONSE')
		} else {}*/

		const requestMessage: ChatCompletionRequestMessage = {"role": ChatCompletionRequestMessageRoleEnum.User, "content": cleanedInputs}
		chat_log.push(requestMessage)

		const completionOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages: chat_log,
			max_tokens: 1000,
			temperature: 1,
			stream: true
		}

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(completionOpts)
		})

		if (!response.ok) {
			const err = await response.json()
			console.error(err)
			throw new Error('Failed to create completion', err)
		}
		console.log(response.body)
		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		throw error(500, 'An error occurred')
	}
}
