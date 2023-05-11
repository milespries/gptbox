<script lang="ts">
	import { onMount } from 'svelte'
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Progressbar, Tabs, TabItem, Range, FloatingLabelInput, Radio, ButtonGroup, Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card } from 'flowbite-svelte'
	import BottomNav from "$lib/custom/BottomNav.svelte"
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"
	import { applyStyles } from '@popperjs/core'
	import { page } from '$app/stores'
	import { SSE } from 'sse.js'

	export let data: PageData;

	let bodyElement

	// let debug = ""
	let nameObject = {
		loading: false,
		stage: 1,
		style: "Auto",
		randomness: "Low",
		settings: {
			keyWords: "",
			blacklistedWords: "",
			maxLetters: 25
		},
		outputs: [""],
		buffer: ""
	}

	onMount(() => {
		bodyElement = document.getElementById('body')
		bodyElement?.setAttribute('class', '')
		bodyElement?.classList.add('pattern-stars-blue-950/20')
	})

	const handleGeneration = () => {
		let count = 0
		nameObject.stage = 4
		// const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "nameStyle": "${nameObject.style}", "nameRandomness": "${nameObject.randomness}", "keywordsToInclude": "${nameObject.settings.keyWords}", "blacklistedWords": "${nameObject.settings.blacklistedWords}", "maxNameLength": ${nameObject.settings.maxLetters < 25 ? nameObject.settings.maxLetters : "no limit" } }`
		nameObject.loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/oneng', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			nameObject.loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				nameObject.loading = false
				// console.log(e.data)
				if (e.data === '[DONE]') {
					// console.log(nameObject)
					// console.log(debug)
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
					// debug = (debug ?? '') + delta.content 
					if(delta.content === " ***") {
						if(nameObject.outputs[0].length === 0) {
							nameObject.outputs[0] = nameObject.buffer
						} else {
							nameObject.outputs.push(nameObject.buffer)
						}
						nameObject.buffer = ''
						return
					} else {
						nameObject.buffer = (nameObject.buffer ?? '') + delta.content
					}
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				nameObject.loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

	const pageReload = () => {
        location.reload()
        return false
    }

	function handleError<T>(err: T) {
		nameObject.loading = false
		nameObject.outputs = []
		console.error(err)
	}

    //f(Object.keys(data.session.config).length === 0){formModal = true}

	//const tools = [0,0,0,0,0,0,0,0,0,0]
	
</script>




<div class="mb-20">
	<div class="block max-w-xl md:w-full mt-8 mx-5 md:mx-auto px-15 box-border">
		<Tabs style="full" defaultClass="flex rounded-lg divide-x divide-gray-200 shadow dark:divide-gray-700">
			{#if nameObject.stage < 4}
				<TabItem class="w-full" on:click={() => {nameObject.stage = 1}} open={nameObject.stage === 1}>
					<span slot="title">Name Style</span>
					<div class="flex-wrap mt-8 -mx-15 items-center justify-center box-border">
						<p class="text-center mb-8 text-3xl font-medium dark:text-white">Select a style</p>
						<div class="grid gap-6 w-full md:grid-cols-2">
						<Radio name="1" value={"Auto"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.style == "Auto" ? "text-blue-500" : "text-gray-300"}">Auto</div>
								<div class="w-full">All Styles</div>
							</div>
							</div>
						</Radio>
						<Radio name="2" value={"Brandable Names"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
								<div class="block">
									<div class="w-full text-lg font-semibold {nameObject.style == "Brandable Names" ? "text-blue-500" : "text-gray-300"}">Brandable Names</div>
									<div class="w-full">like Google or Rolex</div>
								</div>
							</div>
						</Radio>
						<Radio name="3" value={"Alternative Spelling"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.style == "Alternative Spelling" ? "text-blue-500" : "text-gray-300"}">Alternative Spelling</div>
								<div class="w-full">like Lyft and Fiverr</div>
							</div>
							</div>
						</Radio>
						<Radio name="4" value={"Non-English Words"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
								<div class="block">
									<div class="w-full text-lg font-semibold {nameObject.style == "Non-English Words" ? "text-blue-500" : "text-gray-300"}">Non-English Words</div>
									<div class="w-full">like Toyota and Audi</div>
								</div>
							</div>
						</Radio>
						<Radio name="5" value={"Compound Words"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.style == "Compound Words" ? "text-blue-500" : "text-gray-300"}">Compound Words</div>
								<div class="w-full">like FedEx and Microsoft</div>
							</div>
							</div>
						</Radio>
						<Radio name="6" value={"Real Words"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
								<div class="block">
									<div class="w-full text-lg font-semibold {nameObject.style == "Real Words" ? "text-blue-500" : "text-gray-300"}">Real Words</div>
									<div class="w-full">like Apple and Amazon</div>
								</div>
							</div>
						</Radio>
						<Radio name="7" value={"Two Words"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.style == "Two Words" ? "text-blue-500" : "text-gray-300"}">Two Words</div>
								<div class="w-full">like Facebook and Bitcoin</div>
							</div>
							</div>
						</Radio>
						<Radio name="8" value={"Short Phrase"} bind:group={nameObject.style} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
								<div class="block">
									<div class="w-full text-lg font-semibold {nameObject.style == "Short Phrase" ? "text-blue-500" : "text-gray-300"}">Short Phrase</div>
									<div class="w-full">like Dollar Shave Club</div>
								</div>
							</div>
						</Radio>
						</div>
						<div id="bottom" class="mt-10 mb-8">
							<div class="grid grid-flow-col justify-stretch max-w-xs mx-auto">
								<Button size="xl" color="blue" on:click={() => {nameObject.stage = 2}}>Next</Button>
							</div>
						</div>
				</TabItem>
				<TabItem class="w-full" on:click={() => {nameObject.stage = 2}} open={nameObject.stage === 2}>
					<span slot="title">Randomness</span>
					<div class="flex-wrap mt-8 -mx-15 items-center justify-center box-border">
						<p class="text-center mb-8 text-3xl font-medium dark:text-white">Generation Randomness</p>
						<div class="grid gap-6 w-full md:grid-cols-1">
						<Radio name="1" value={"Low"} bind:group={nameObject.randomness} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.randomness == "Low" ? "text-blue-500" : "text-gray-300"}">Low</div>
								<div class="w-full">Less random. The most direct name ideas.</div>
							</div>
							</div>
						</Radio>
						<Radio name="2" value={"Medium"} bind:group={nameObject.randomness} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
								<div class="block">
									<div class="w-full text-lg font-semibold {nameObject.randomness == "Medium" ? "text-blue-500" : "text-gray-300"}">Medium</div>
									<div class="w-full">Balanced. More creative results.</div>
								</div>
							</div>
						</Radio>
						<Radio name="3" value={"High"} bind:group={nameObject.randomness} custom>
							<div class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
							<div>
								<div class="w-full text-lg font-semibold {nameObject.randomness == "High" ? "text-blue-500" : "text-gray-300"}">High</div>
								<div class="w-full">Random ideas. More varied results.</div>
							</div>
							</div>
						</Radio>
						</div>
					</div>
						<div id="bottom" class="mt-10 mb-8">
							<div class="grid grid-flow-col justify-stretch max-w-xs mx-auto">
								<Button size="xl" shadow="blue" gradient color="blue" on:click={() => {handleGeneration()}}>Generate</Button>
							</div>
						</div>
				</TabItem>
				<TabItem class="" on:click={() => {nameObject.stage = 3}} open={nameObject.stage === 3}>
					<div slot="title" class="flex items-center gap-2">
						<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
					  </div>
					<div class="flex-wrap mt-8 -mx-15 items-center justify-center box-border">
						<p class="text-center mb-12 text-3xl font-medium dark:text-white">Optional Settings</p>
						<div class="grid gap-10 w-full md:grid-cols-1 mb-8">
							<div>
								<FloatingLabelInput bind:value={nameObject.settings.keyWords} style="filled" type="text" label="Brand Keywords"/>
								<Helper class="pt-2">Add any keywords that may be related to your idea or business.</Helper>
							</div>
							<div>
								<FloatingLabelInput bind:value={nameObject.settings.blacklistedWords} style="filled" type="text" label="Blacklist Words"/>
								<Helper class="pt-2">Words, prefixes or suffixes that should not be generated (separate with commas).</Helper>
							</div>
							<div>
								<Range bind:value={nameObject.settings.maxLetters} id="range-minmax" size="lg" min="5" max="25"/>
								<Helper class="pt-2">Maximum length of generated names: {nameObject.settings.maxLetters === 25 ? "none" : nameObject.settings.maxLetters + " letters"}</Helper>
							</div>
						</div>
					</div>
				</TabItem>
			{:else if nameObject.stage === 4}
				<TabItem class="w-full" open={nameObject.stage === 4}>
					<div slot="title" class="">
							<Progressbar progress="{((nameObject.outputs.length) * 5).toString()}" color="{nameObject.outputs.length === 20 ? "green" : "blue"}" size="h-5" />
					</div>
					<div class="flex-wrap -mx-15 items-center justify-center box-border">
						<div>
							<Table striped={true}>
								<TableHead>
								  <TableHeadCell>Name</TableHeadCell>
								</TableHead>
								<TableBody>
									{#each nameObject.outputs as output}
										<TableBodyRow>
											<TableBodyCell>{output}</TableBodyCell>
										</TableBodyRow>
									{/each}
								</TableBody>
							  </Table>
						</div>
						<div class="grid gap-6 w-full md:grid-cols-2"></div>

				</TabItem>
				<TabItem on:click={() => {nameObject.stage = 1; nameObject.outputs = [""]; nameObject.buffer = ""}} class="w-1/4" open={false}>
					<span slot="title">Back</span>
				</TabItem>
			{/if}
		  </Tabs>
	</div>
</div>
<div class="h-10"></div>
<BottomNav data={data} authorizedUser={data.user.config}/>