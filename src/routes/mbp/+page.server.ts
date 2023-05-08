import { fail, redirect } from "@sveltejs/kit"
import { z } from "zod"
import { superValidate } from "sveltekit-superforms/server"
import { updateConfig } from "$lib/server/auth.js"
import { prisma } from "$lib/server/prisma"

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

const sharkTankPitchDataSchemaA = z.object({
	main_competitors: z.string().min(1),
	unique_selling_proposition: z.string().min(1),
	key_milestones: z.string().min(1),
	partnerships_collaborations_mentors: z.string().min(1),
	revenue_streams: z.string().min(1),
	funding_or_resources_needed: z.string().min(1),
	customer_acquisition_strategy: z.string().min(1),
	social_environmental_impact: z.string().min(1),
})


export const load = (async (event) => {
	const requiredFormA = await superValidate(newBusinessDataSchemaA, {
		id: 'requiredFormA'
	})
	const sharkTankPitchFormA = await superValidate(sharkTankPitchDataSchemaA, {
		id: 'sharkTankPitchFormA'
	})
	return { 
		requiredFormA,
		sharkTankPitchFormA,
		user: event.locals.user
	}
})

export const actions = {
	required: async (event) => {
		const form = await superValidate(event, newBusinessDataSchemaA, {
			id: 'requiredFormA'
		})
		
		console.log(form)
	
		if (!form.valid) {
			return fail(400, { form })
		} else {
			updateConfig(form, event, false)
			try {
				await prisma.user.update({
					where: {
						uuid: event.locals.user?.uuid,
					},
					data: {
						configs: {
							create: {
								businessName: event.locals.user?.config.name,
								businessIndustry: event.locals.user?.config.industry,
								businessTargetMarket: event.locals.user?.config.target_market,
								businessIdeaStage: event.locals.user?.config.idea_stage,
								businessIdea: event.locals.user?.config.business_idea,
								businessProblemSolved: event.locals.user?.config.problem_solved,
								businessUniqueSellingPoint: event.locals.user?.config.selling_point,
								businessMarketResearch: event.locals.user?.config.marketResearch,
								businessTeam: event.locals.user?.config.teamMembers,
								businessFunding: event.locals.user?.config.fundingOrHelp
							}
						}
					},
				})
			} catch (err) {
				console.error(err)
				return fail(500, { message: "error 432" })
			}
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