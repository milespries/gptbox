import type { RequestEvent } from "@sveltejs/kit"

export const createSession = (event: RequestEvent) => {
	// get the cookies from the request
	const { cookies } = event

	// get the user token from the cookie
	const sessionUUID = cookies.get("uuid")
	console.log(sessionUUID)

	// if the user token is not valid, return null
	// this is where you would check the user token against your database
	// to see if it is valid and return the user object
	if (sessionUUID) {
		console.log('success')
		const session = {
			uuid: sessionUUID
		}
		return session
	}

	return null
}
