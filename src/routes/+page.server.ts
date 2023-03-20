import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ( event ) => {
	//console.log(locals.session)
	return {
		session: event.locals.session
	}
}