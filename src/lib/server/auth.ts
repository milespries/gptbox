import type { RequestEvent } from "@sveltejs/kit"
import { LZString } from "$lib/lz-string.min"
import type { Validation } from "sveltekit-superforms/index"
import cryptoRandomString from 'crypto-random-string'


export const authenticateUser = (event: RequestEvent) => {
	// get the cookies from the request
	const { cookies } = event

	// get the user token from the cookie
	const deobfConfig = cookies.get("config") ? JSON.parse(LZString.decompressFromBase64(cookies.get("config"))) : null
	const userUUID = cookies.get("key")

	// if the user token is not valid, return null
	// this is where you would check the user token against your database
	// to see if it is valid and return the user object
	if (deobfConfig) {
		const user = {
			uuid: userUUID,
			config: deobfConfig.config,
			extraData1: deobfConfig.extraData1
		}
		return user
	} else {
		const user = {
			uuid: userUUID,
			config: undefined,
			extraData1: undefined
		}
		return user
	}

	return null
}

export const serializeUser = (event: RequestEvent) => {
	const uuid = cryptoRandomString({length: 69, type: 'alphanumeric'})
	if(!event.cookies.get("key")){
		event.cookies.set("key", uuid, {
			path: "/",
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7,
			secure: true,
			sameSite: "strict"
		})
	}
}

export const updateConfig = (form, event: RequestEvent, addRequest: boolean) => {
	let condense: string
	console.log(form.data)
	if(addRequest){
		condense = LZString.compressToBase64(JSON.stringify({config: event.locals.user.config, extraData1: form.data}))
	} else {
		condense = LZString.compressToBase64(JSON.stringify({config: form.data}))
	}
	event.cookies.set("config", condense, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 7,
		secure: true,
		sameSite: "strict"
	})
}
