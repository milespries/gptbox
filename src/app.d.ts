// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

type Session = {
	uuid: string
}

declare global {

	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null
		}
		// interface PageData {}
		// interface Platform {}
		interface ImportMetaEnv {
			VITE_MESSAGE: string
		}
	}
}

export {};
