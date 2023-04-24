<script lang="ts">
    import type { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
	import { SSE } from 'sse.js'

    import { onMount } from 'svelte'
	import { BottomNav, BottomNavItem, Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card, Hr } from 'flowbite-svelte'
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"

	export let data: PageData;

    let sharkTankPitchGeneration = {
        name: {string: "", status: false},
        problem: {string: "", status: false},
        solution: {string: "", status: false},
        marketSize: {string: "", status: false},
        traction: {string: "", status: false},
        moneyMethod: {string: "", status: false},
        team: {string: "", status: false},
        finalRequest: {string: "", status: false}
    }
    let authorizedUser = false
	let formModal = false
    let extraFormModal1 = false
    let temp_loading = false
    let loading = false
    let complete = false

    console.log(data.user)
    //f(Object.keys(data.session.config).length === 0){formModal = true}
	
	const { form, errors, enhance, constraints } = superForm(data.requiredFormA, {
		taintedMessage: "Are you sure you want leave? All current form data will be lost.",
		validators: {
			name: (name) => (name.length < 2 ? "Idea name is too short." : null),
			industry: (industry) => (industry.length < 2 ? "Incomplete Input." : null),
			target_market: (target_market) => (target_market.length < 2 ? "Incomplete Input." : null),
			business_idea: (business_idea) => (business_idea.length < 50 ? "Needs more information." : null),
			problem_solved: (problem_solved) => (problem_solved.length < 2 ? "Incomplete Input." : null),
            key_features: (selling_point) => (selling_point.length < 20 ? "Needs more information." : null),
            idea_stage: (selling_point) => (selling_point.length < 2 ? "Incomplete Input." : null)
		},
		invalidateAll: false,
		onUpdated({ form }) {
			if (form.valid) {
                formModal = false
                authorizedUser = true
                location.reload()
                return false
			}
		}
	})

	const { form: extra1Form, errors: extra1Errors, enhance: extra1Enhance } = superForm(data.extra1Form, {
		validators: {
			marketResearch: (marketResearch) => (marketResearch.length < 5 ? "Incomplete Input." : null),
			marketingStrategy: (marketingStrategy) => (marketingStrategy.length < 5 ? "Incomplete Input." : null),
			teamMembers: (teamMembers) => (teamMembers.length < 5 ? "Incomplete Input." : null),
			fundingOrHelp: (fundingOrHelp) => (fundingOrHelp.length < 4 ? "Incomplete Input." : null)
		},
        invalidateAll: false,
        onUpdated({ form }) {
			if (form.valid) {
                extraFormModal1 = false
                location.reload()
                return false
			}
		}
	})

	//$form.name = "test"
    if(data.user.config){
		$form = data.user.config
        if(data.user?.extraData1){
            $extra1Form = data.user.extraData1
        }
	} else {
		formModal = true
	}

    const clearFields = () => {
        $form = {}
        if(data.user?.extraData1){
            $extra1Form = {}
        }
    }

    const handleSubmit = async () => {
		//const botResponse = answer ?? undefined

        if(temp_loading) return

		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content: JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) }]

		const eventSource = new SSE('/api/mbp/stp/first', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.name.status = true
                    handleSecondStage(sharkTankPitchGeneration.name.string)
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
					sharkTankPitchGeneration.name.string = (sharkTankPitchGeneration.name.string ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleSecondStage = async (string) => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/mbp/stp/second', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.problem.status = true
                    sharkTankPitchGeneration.solution.status = true
                    handleThirdStage(sharkTankPitchGeneration.name.string, sharkTankPitchGeneration.problem.string, sharkTankPitchGeneration.solution.string)
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    if(delta.content.includes('*')){sharkTankPitchGeneration.problem.status = true; return}
                    switch(sharkTankPitchGeneration.problem.status) {
                        case false:
                            sharkTankPitchGeneration.problem.string = (sharkTankPitchGeneration.problem.string ?? '') + delta.content
                            break
                        case true:
                            sharkTankPitchGeneration.solution.string = (sharkTankPitchGeneration.solution.string ?? '') + delta.content
                            break
                    }
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleThirdStage = async (string1, string2, string3) => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${string1}", "problemOutput": "${string2}", "solutionOutput": "${string3}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/mbp/stp/third', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.marketSize.status = true
                    sharkTankPitchGeneration.traction.status = true
                    handleFourStage()
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    if(delta.content.includes('*')){sharkTankPitchGeneration.marketSize.status = true; return}
                    switch(sharkTankPitchGeneration.marketSize.status) {
                        case false:
                            sharkTankPitchGeneration.marketSize.string = (sharkTankPitchGeneration.marketSize.string ?? '') + delta.content
                            break
                        case true:
                            sharkTankPitchGeneration.traction.string = (sharkTankPitchGeneration.traction.string ?? '') + delta.content
                            break
                    }
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleFourStage = async () => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${sharkTankPitchGeneration.name.string}", "problemOutput": "${sharkTankPitchGeneration.problem.string}", "solutionOutput": "${sharkTankPitchGeneration.solution.string}", "marketSizeOutput": "${sharkTankPitchGeneration.marketSize.string}", "tractionOutput": "${sharkTankPitchGeneration.traction.string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/mbp/stp/four', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.moneyMethod.status = true
                    if(data.user?.extraData1){
                        handleFiveStage()
                    } else {
                        complete = true
                    }
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    sharkTankPitchGeneration.moneyMethod.string = (sharkTankPitchGeneration.moneyMethod.string ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleFiveStage = async () => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${sharkTankPitchGeneration.name.string}", "problemOutput": "${sharkTankPitchGeneration.problem.string}", "solutionOutput": "${sharkTankPitchGeneration.solution.string}", "marketSizeOutput": "${sharkTankPitchGeneration.marketSize.string}", "tractionOutput": "${sharkTankPitchGeneration.traction.string}", "revenueMethodOutput": "${sharkTankPitchGeneration.moneyMethod.string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/mbp/stp/five', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.team.status = true
                    handleSixStage()
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    sharkTankPitchGeneration.team.string = (sharkTankPitchGeneration.team.string ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleSixStage = async () => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${sharkTankPitchGeneration.name.string}", "problemOutput": "${sharkTankPitchGeneration.problem.string}", "solutionOutput": "${sharkTankPitchGeneration.solution.string}", "marketSizeOutput": "${sharkTankPitchGeneration.marketSize.string}", "tractionOutput": "${sharkTankPitchGeneration.traction.string}", "revenueMethodOutput": "${sharkTankPitchGeneration.moneyMethod.string}", "finalRequest": "${sharkTankPitchGeneration.finalRequest.string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/mbp/stp/six', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    sharkTankPitchGeneration.finalRequest.status = true
                    // handleSecondStage(sharkTankPitchGeneration.problem.string)
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    sharkTankPitchGeneration.finalRequest.string = (sharkTankPitchGeneration.finalRequest.string ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    function handleError<T>(err: T) {
		loading = false
		sharkTankPitchGeneration.name.string = ''
		console.error(err)
	}

</script>

<div class="w-full flex flex-col sm:flex-row flex-grow overflow-hidden">
    <div class="sm:w-1/3 md:1/4 w-full flex-shrink flex-grow-0 p-4">
        <div class="rounded-xl border shadow-2xl shadow-purple-800/80 focus:ring-purple-800 focus:ring-4 focus:outline-none border-gray-700 bg-gray-800 my-3 w-full">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:py-12 lg:px-8 lg:flex lg:items-center lg:justify-between">
                <Button size="xl" disabled="{temp_loading}" on:click={() => {handleSubmit()}}>Generate</Button>
            </div>
        </div>
    </div>
    <main role="main" class="w-full h-full flex-grow p-3 overflow-auto text-center">
        <div class="mb-20 py-3">
        {#if sharkTankPitchGeneration.name.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Title with one liner</span></Hr>
            <p class="text-xl md:text-3xl mb-4 font-extrabold" id="home">{sharkTankPitchGeneration.name.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.problem.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Selling the Problem</span></Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.problem.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.solution.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Selling the Solution</span></Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.solution.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.marketSize.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Size of the Market</span></Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.marketSize.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.traction.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Showing your Traction</span></Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.traction.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.moneyMethod.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">How <span class="font-bold">{data.user.config.name}</span> Generates Revenue</span></Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.moneyMethod.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.team.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">The Team</Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.team.string}</p>
        {/if}
        {#if sharkTankPitchGeneration.finalRequest.string.length > 0}
            <Hr class="my-8" height="h-1"><span class="text-slate-400">Final request & ending</Hr>
            <p class="py-2 text-xl">{sharkTankPitchGeneration.finalRequest.string}</p>
        {/if}
        {#if complete}
            <div class="flex flex-row justify-center mt-8">
                <p class="m-1 text-slate-300 text-sm align-bottom">A better pitch needs more context. See the difference for yourself by answering a few more questions.</p>
                <Button on:click={() => {extraFormModal1 = true}} size="xs">Here</Button>
            </div>
        {/if}
        </div>
        
        <div id="bottom"></div>
    </main>
    <BottomNav position="fixed" innerDiv="grid-cols-2">
        <BottomNavItem btnName="Apps" on:click={() => (window.location.href="/mbp")}>
            <svg
                class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <g>
                    <rect x="3" y="3" width="5" height="5" rx="1" ry="1" />
                    <rect x="12" y="3" width="5" height="5" rx="1" ry="1" />
                    <rect x="3" y="12" width="5" height="5" rx="1" ry="1" />
                    <rect x="12" y="12" width="5" height="5" rx="1" ry="1" />
                </g>
            </svg>
        </BottomNavItem>
        <BottomNavItem btnName="My Business" on:click={() => (formModal=true)}>
            <svg
                class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
                />
            </svg>
        </BottomNavItem>
    </BottomNav>
    
    <Modal bind:open={formModal} size="xs" autoclose={false} permanent={!data.user.config} class="w-full" id="modal1">
        {#if !data.user.config}
            <p class="text-gray-900 dark:text-red-500 p-0">
                <span class="font-bold">*</span>Required
            </p>
            <Heading tag="h1" class="mb-4 text-center" customSize="text-4xl font-extrabold  md:text-5xl lg:text-6xl"><Span gradient>Let's Get Started!</Span></Heading>
            <P>Share a few details about your business idea to unlock AI-powered tools tailored just for you.</P>
        {:else if data.user.config}
            <h1 class="py-5 text-3xl md:text-4xl lg:text-5xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 to-sky-300">
                {data.user.config.name}
            </h1>
        {/if}
        {#if false}
            <h3 class="text-xl text-center font-medium text-gray-900 dark:text-white p-0">What stage are you in?</h3>
            <form class="flex flex-col space-y-6" action="#">
                <Button type="submit" class="w-full">Idea</Button>
                <Button type="submit" class="w-full">Start Up</Button>
                <Button type="submit" class="w-full">Established</Button>
            </form>
        {:else if true}
            <form method="POST" autocomplete="off" action="?/required" use:enhance>
                <div class="grid gap-6 mb-6">
                  <div>
                    <Label for="aA" class="mb-2">Business Name</Label>
                    <Input type="text" id="aA" placeholder="(can be refined later)" name="name" bind:value={$form.name} required />
                    {#if $errors.name}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.name}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aB" class="mb-2">Business Industry</Label>
                    <Input type="text" id="aB" placeholder="(e.g., Retail, Healthcare, Technology)" name="industry" bind:value={$form.industry} required />
                    {#if $errors.industry}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.industry}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aC" class="mb-2">Target Market</Label>
                    <Input type="text" id="aC" placeholder="(e.g., Millennials, Working Professionals, Parents)" name="target_market" bind:value={$form.target_market} required />
                    {#if $errors.target_market}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.target_market}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aD" class="mb-2">Business Idea</Label>
                    <Textarea id="aD" placeholder="Briefly describe your business idea in 2-3 sentences:" rows="4" name="business_idea" bind:value={$form.business_idea} required />
                    {#if $errors.business_idea}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.business_idea}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aE" class="mb-2">Problem Solved</Label>
                    <Textarea id="aE" placeholder="What problem will your business solve?" rows="4" name="problem_solved" bind:value={$form.problem_solved} required />
                    {#if $errors.problem_solved}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.problem_solved}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aF" class="mb-2">Unique Selling Point</Label>
                    <Textarea id="aF" placeholder="Explain what sets your product or service apart from competitors. List 2-3 main features of your product or service that make it stand out provide value." rows="4" name="selling_point" bind:value={$form.selling_point} required />
                    {#if $errors.selling_point}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.selling_point}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="aF" class="mb-2">Idea Stage</Label>
                    <Textarea id="aF" placeholder="Describe the current stage of your idea (e.g., Just an idea, Sketches, Prototype, MVP, etc.)" rows="4" name="idea_stage" bind:value={$form.idea_stage} required />
                    {#if $errors.idea_stage}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.idea_stage}</Helper>
                    {/if}
                  </div>
                  <div class="flex flex-row justify-between">
                    <Button on:click={() => {extraFormModal1 = true}} size="xs">More</Button>
                    <Button on:click={() => {clearFields()}} size="xs" color="red">Reset</Button>
                  </div>
                {#if !data.user.config}
                    <P size="xs">By submitting, I agree to the terms of the <A class="font-bold" href="#">MBP© Privacy Policy</A></P>
                {/if}
                <Button class="mb-10 mt-3" size="xl" type="submit">{data.user.config ? "Save Changes" : "Submit"}</Button>
              </form>
            <!--<form class="flex flex-col space-y-6" action="#">
                <Input type="email" placeholder="Type Here..." size="lg" />
                <div class="flex flex-row space-x-4">
                    <Button outline type="submit" class="w-1/4">Back</Button>
                    <Button type="submit" class="w-3/4">Next</Button>
                </div>
            </form>-->
        {/if}
    </Modal>

    <Modal bind:open={extraFormModal1} size="xs" autoclose={false} class="w-full" id="modal2">
        <P size="xl" space="wide" weight="semibold" class="mt-8">Share a few more details about {data.user.config.name} to further fine tune your AI tools.</P>
        {#if false}
         <h1>nothing</h1>>
        {:else if true}
            <form method="POST" autocomplete="off" action="?/add" use:extra1Enhance>
                <div class="grid gap-6 mb-6">
                  <div>
                    <Label for="bA" class="mb-2">Market research</Label>
                    <Textarea id="bA" placeholder="Briefly describe any market research or validation you have conducted. Or feedback you've received from potential customers." rows="3" name="marketResearch" bind:value={$extra1Form.marketResearch} required />
                    {#if $extra1Errors.marketResearch}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$extra1Errors.marketResearch}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="bB" class="mb-2">Marketing strategy</Label>
                    <Textarea id="bB" placeholder="Outline how you plan to reach your target market and promote your product or service (e.g., social media, events, etc.)" rows="3" name="marketingStrategy" bind:value={$extra1Form.marketingStrategy} required />
                    {#if $extra1Errors.marketingStrategy}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$extra1Errors.marketingStrategy}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="bD" class="mb-2">Team members and roles</Label>
                    <Textarea id="bD" placeholder="List your team members and their roles or skills they bring to the team." rows="3" name="teamMembers" bind:value={$extra1Form.teamMembers} required />
                    {#if $extra1Errors.teamMembers}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$extra1Errors.teamMembers}</Helper>
                    {/if}
                  </div>
                  <div>
                    <Label for="bE" class="mb-2">Funding or help request</Label>
                    <Textarea id="bE" placeholder="Specify what you're asking for in your pitch (e.g., investment, mentorship, partnerships, etc.), and provide a brief reason for the request." rows="3" name="fundingOrHelp" bind:value={$extra1Form.fundingOrHelp} required />
                    {#if $extra1Errors.fundingOrHelp}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$extra1Errors.fundingOrHelp}</Helper>
                    {/if}
                  </div>
                <Button class="mb-10 mt-3" type="submit">{data.user.extraData1 ? "Save Changes" : "Submit"}</Button>
              </form>
            <!--<form class="flex flex-col space-y-6" action="#">
                <Input type="email" placeholder="Type Here..." size="lg" />
                <div class="flex flex-row space-x-4">
                    <Button outline type="submit" class="w-1/4">Back</Button>
                    <Button type="submit" class="w-3/4">Next</Button>
                </div>
            </form>-->
        {/if}
    </Modal>
</div>