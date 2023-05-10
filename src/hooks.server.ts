import { LZString } from "$lib/lz-string.min"
import { prisma } from "$lib/server/prisma"
import { authenticateUser, serializeUser } from "$lib/server/auth"
import { error, fail } from "@sveltejs/kit"

export const handle = async ({ event, resolve }) => {
	serializeUser(event)
	event.locals.user = authenticateUser(event)
	const uuidLookup = async () => {
		const user = await prisma.user.findUnique({
			where: {
				uuid: event.locals.user?.uuid,
			},
		})
		if (!user) {
			// throw error(404, "error")
			return false
		}
		return user
	}
	const userCreate = async () => {
		try {
			if(event.locals.user != undefined){
				await prisma.user.create({
					data: {
						uuid: event.locals.user?.uuid
					},
				})
			}
		} catch (err) {
			console.error(err)
			return false
			// return fail(500, { message: "Could not create the article."})
		}
		return true
	}
	uuidLookup().then((user) => {
		if(user){
			if(event.locals.user != undefined){
				event.locals.user.authorized = true
			}
		} else {
			userCreate()
		}
	})
	//console.log('test')
	return resolve(event)
}