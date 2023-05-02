<script lang="ts">
	import { onMount } from 'svelte'
	import { BottomNavItem, Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card } from 'flowbite-svelte'
	import BottomNav from "$lib/custom/BottomNav.svelte"
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"
	import { applyStyles } from '@popperjs/core'
	import { page } from '$app/stores'

	export let data: PageData;

    //f(Object.keys(data.session.config).length === 0){formModal = true}

	//const tools = [0,0,0,0,0,0,0,0,0,0]
	
</script>

<div class="lg:flex lg:flex-col lg:items-center lg:py-14 pb-6 pt-11 px-7">

	<div>
		{#if true}
			<div id="apps" class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card href="{data.user.config ? "/mbp/stp" : "/mbp?form=true"}">
					<h5 class="mb-2 text-2xl font-bold tracking-tight text-white">Shark Tank Pitch</h5>
					<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
						Unleash the power of AI to create a compelling pitch for your business idea.
					</p>
					<!-- <p class="font-extrabold text-gray-700 dark:text-gray-400 leading-tight">
						<Span>*</Span>Few more questions required
					</p> -->
				</Card>
			</div>
		{/if}
	</div>
	
	<BottomNav data={data} authorizedUser={data.user.config}/>

</div>