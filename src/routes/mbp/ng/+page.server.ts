import { fail, redirect } from "@sveltejs/kit"
import { z } from "zod"
import { superValidate } from "sveltekit-superforms/server"
import { updateConfig } from "$lib/server/auth.js"

const newBusinessDataSchemaA = z.object({
	name: z.string().min(1),
	industry: z.string().min(1),
	target_market: z.string().min(1),
	business_idea: z.string().min(1),
	problem_solved: z.string().min(1),
	selling_point: z.string().min(1),
    idea_stage: z.string().min(1)
})

const extra1FormSchema = z.object({
	marketResearch: z.string().min(1),
	teamMembers: z.string().min(1),
	fundingOrHelp: z.string().min(1)
})

export const load = (async (event) => {
	if(!event.locals.user.config){
		throw redirect(302, "/mbp")
	}

	const requiredFormA = await superValidate(newBusinessDataSchemaA, {
		id: 'requiredFormA'
	})
	const extra1Form = await superValidate(extra1FormSchema, {
		id: 'extra1Form'
	})
	return { 
		requiredFormA,
		extra1Form,
		user: event.locals.user
	}
})

export const actions = {
	required: async (event) => {
		const form = await superValidate(event, newBusinessDataSchemaA, {
            id: 'requiredFormA'
        })
	
		if (!form.valid) {
			return fail(400, { form })
		} else {
			updateConfig(form, event, false)
		}
	
		return { form }
	},
	add: async (event) => {
		const form = await superValidate(event, extra1FormSchema, {
            id: 'extra1Form'
        })
	
		if (!form.valid) {
			return fail(400, { form })
		} else {
			updateConfig(form, event, true)
		}
	
		return { form }
	},
	reset: async (event) => {
		event.cookies.delete('config')
		throw redirect(302, "/mbp")
	}
}