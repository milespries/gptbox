import { createSession } from "$lib/server/auth"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	// Stage 1
	const { cookies } = event

    if (!cookies.get("uuid")){
        const uuid = crypto.randomUUID()
        cookies.set("uuid", uuid, {
            path: "/",
            httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 1 week
        })
    }

	event.locals.session = createSession(event)

	const response = await resolve(event) // Stage 2

	// Stage 3

	return response
}
