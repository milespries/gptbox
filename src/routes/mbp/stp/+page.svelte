<script lang="ts">
    import type { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
	import { SSE } from 'sse.js'

    import { onMount } from 'svelte'
	import { Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card, Hr } from 'flowbite-svelte'
    import BottomNav from "$lib/custom/BottomNav.svelte"
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"

	export let data: PageData;
    
    $: extraFormModal1 = false

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
    let temp_loading = false
    let loading = false
    let complete = false

    let bodyElement;
	onMount(() => {
		bodyElement = document.getElementById('body')
		bodyElement?.setAttribute('class', '')
		bodyElement?.classList.add('pattern-brick-wall-blue-950/20')
	})

    console.log(data.user)
    //f(Object.keys(data.session.config).length === 0){formModal = true}

    const handleSubmit = async () => {
		//const botResponse = answer ?? undefined

        if(temp_loading) return

		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content: JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) }]

		const eventSource = new SSE('/api/first', {
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
                    handleSecondStage()
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

    const handleSecondStage = async () => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${sharkTankPitchGeneration.name.string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/second', {
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
                    handleThirdStage()
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

    const handleThirdStage = async () => {
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify(data.user.extraData1 ? {...data.user.config, ...data.user.extraData1} : data.user.config) + "\n" + `{ "titleOutput": "${sharkTankPitchGeneration.name.string}", "problemOutput": "${sharkTankPitchGeneration.problem.string}", "solutionOutput": "${sharkTankPitchGeneration.solution.string}" }`
		loading = true
        temp_loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/third', {
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

		const eventSource = new SSE('/api/four', {
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

		const eventSource = new SSE('/api/five', {
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

		const eventSource = new SSE('/api/six', {
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
                <p class="m-1 text-slate-300 text-sm align-bottom">A better pitch needs more context. See the difference yourself by answering a few more questions.</p>
                <Button on:click={() => {extraFormModal1 = true}} size="xs">Here</Button>
            </div>
        {/if}
        </div>
        
        <div id="bottom"></div>
    </main>
</div>
<BottomNav data={data} authorizedUser={data.user.config} extraFM1={extraFormModal1} />