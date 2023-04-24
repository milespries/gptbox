import { LZString } from "$lib/lz-string.min"
import { authenticateUser, serializeUser } from "$lib/server/auth"

export const handle = async ({ event, resolve }) => {
	serializeUser(event)
	event.locals.user = authenticateUser(event)
	//console.log('test')
	return resolve(event)
}