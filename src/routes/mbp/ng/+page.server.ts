import { fail, redirect } from "@sveltejs/kit"
import { z } from "zod"
import { superValidate } from "sveltekit-superforms/server"
import { updateConfig } from "$lib/server/auth.js"


export const load = (async (event) => {
	return { 
		user: event.locals.user
	}
})

export const actions = {
	reset: async (event) => {
		event.cookies.delete('config')
		throw redirect(302, "/mbp")
	}
}