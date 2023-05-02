// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare global {

	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				uuid: string,
				authorized: boolean,
				config: object,
				extraData1: object
			} | null
		}
		// interface PageData {}
		// interface Platform {}
		interface ImportMetaEnv {
			VITE_MESSAGE: string
		}
	}
}

export {};
