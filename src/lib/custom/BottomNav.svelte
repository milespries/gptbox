<script lang="ts">
    import { SSE } from 'sse.js'
	import { onMount } from 'svelte'
	import { Badge, Spinner, BottomNav, BottomNavItem, Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card } from 'flowbite-svelte'
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"
	import { page } from '$app/stores'

	export let data: PageData;
    export let authorizedUser = false;
    export let extraFM1 = false;
    
    const pageReload = () => {
        location.reload()
        return false
    }
    $: output = ''
    $: outputObj = {}

    let autoComplete = {
        outputs: [""],
        buffer: "",
        undoCache: ["", "", ""],
        loading: false
    }

    $: if(autoComplete.loading) {
        $form.business_idea = autoComplete.outputs[0]
        $form.problem_solved = autoComplete.outputs[1]
        $form.selling_point = autoComplete.outputs[2]
    }

    $: formvcaLoading = false
    $: formvcaComplete = false
    $: formvcaFail = false
    $: if (extraFM1) {
        extraFormModal1 = true
    }
    $: if(formvcaComplete) {
        formvcaLoading = false
        formModal = false
        authorizedUser = true
        appContainer.classList.remove('blur-sm')
        pageReload()
    }
    $: if (formvcaFail) {
        formModal = false
        failModal = true
    }
    $: failModal = false
    $: extraFormModal1 = false
	$: formModal = false
	$: if($page.url.searchParams.get("form") && !authorizedUser){
			formModal = true
			if(appContainer){
				appContainer.classList.add('blur-sm')
			}
		}

	
	const { form, errors, enhance, constraints } = superForm(data.requiredFormA, {
		taintedMessage: "Are you sure you want leave? All current form data will be lost.",
		validators: {
			name: (name) => (name.length < 2 ? "Idea name is too short." : null),
			industry: (industry) => (industry.length < 2 ? "Incomplete Input." : null),
			target_market: (target_market) => (target_market.length < 2 ? "Incomplete Input." : null),
			business_idea: (business_idea) => (business_idea.length < 15 ? "Needs more information." : null),
			problem_solved: (problem_solved) => (problem_solved.length < 2 ? "Incomplete Input." : null),
			selling_point: (selling_point) => (selling_point.length < 15 ? "Needs more information." : null),
            idea_stage: (selling_point) => (selling_point.length < 2 ? "Incomplete Input." : null)
		},
		invalidateAll: false,
		onUpdated({ form }) {
			if (form.valid) {
                formvcaLoading = true
                if(!authorizedUser){
                    validCheck(form.data)
                } else {
                    formModal = false
                    formvcaLoading = false
                    authorizedUser = true
                    appContainer.classList.remove('blur-sm')
                    location.reload()
                    return false
                }
			}
		}
	})

    const { form: extra1Form, errors: extra1Errors, enhance: extra1Enhance } = superForm(data.extra1Form, {
		validators: {
			marketResearch: (marketResearch) => (marketResearch.length < 5 ? "Incomplete Input." : null),
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

	$: if(data.user.config){
		$form = data.user.config
        if(data.user?.extraData1){
            $extra1Form = data.user.extraData1
        }
	}

    const clearFields = () => {
        $form = {}
        if(data.user?.extraData1){
            $extra1Form = {}
        }
    }

    const handleAutoComplete = async (formData) => {
        if(!autoComplete.loading) {
            autoComplete.undoCache[0] = $form.business_idea
            autoComplete.undoCache[1] = $form.problem_solved
            autoComplete.undoCache[2] = $form.selling_point
        }
		let count = 1
		//const botResponse = answer ?? undefined
        const content: String = JSON.stringify({...formData})
		autoComplete.loading = true
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/ac', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			autoComplete.loading = false
            handleError(e)
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				//console.log(e.data)
				if (e.data === '[DONE]') {
					//answer = ''
                    autoComplete.loading = false
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
					if(delta.content === " ***") {
						count++
                        if(count === 4){
                            $form.problem_solved = $form.problem_solved.substring(1)
                            $form.selling_point = $form.selling_point.substring(1)
                        }
						return
					} else {
                        switch(count) {
                            case 1:
                                $form.business_idea = ($form.business_idea ?? '') + delta.content
                                break
                            case 2:
                                $form.problem_solved = ($form.problem_solved ?? '') + delta.content
                                break
                            case 3:
                                $form.selling_point = ($form.selling_point ?? '') + delta.content
                                break
                        }
						
					}
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				autoComplete.loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    const handleUndoAC = () => {
        $form.business_idea = autoComplete.undoCache[0]
        $form.problem_solved = autoComplete.undoCache[1]
        $form.selling_point = autoComplete.undoCache[2]
        autoComplete.undoCache = ["", "", ""]
    }
    
    const validCheck = async (formData) => {
		//const botResponse = answer ?? undefined
        const content: string = JSON.stringify(formData)
		const chatMessages = [{ role: 'user', content }]

		const eventSource = new SSE('/api/formvca', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', (e) => {
			//loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				//loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    outputObj = JSON.parse(output)
                    if(outputObj.valid === "true"){
                        formvcaComplete = true
                    } else {
                        formvcaFail = true
                    }
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
                    output = (output ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				formvcaLoading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}

    let appContainer: HTMLDivElement
    let mainForm: HTMLFormElement
    let resetForm: HTMLFormElement

	onMount(() => {
		appContainer = document.getElementById('apps')
        mainForm = document.getElementById('mainForm')
        resetForm = document.getElementById('reset')
	})

    function handleError<T>(err: T) {
		formvcaLoading = false
		output = ''
		console.error(err)
	}
	//const tools = [0,0,0,0,0,0,0,0,0,0]
	
</script>
	
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
    <BottomNavItem btnName="My Business" on:click={() => {formModal=true; if(!data.user.config){appContainer.classList.add('blur-sm')}}}>
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
            <form id="mainForm" method="POST" autocomplete="off" action="?/required" use:enhance>
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
                    <Label for="aF" class="mb-2">Idea Stage</Label>
                    <Input id="aF" placeholder="(e.g., Just an idea, Sketches, Prototype, MVP, etc.)" name="idea_stage" bind:value={$form.idea_stage} required />
                    {#if $errors.idea_stage}
                        <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.idea_stage}</Helper>
                    {/if}
                    </div>
                    <div>
                    <div class="flex flex-row justify-between">
                        <Label for="aD" class="mb-2">Business Idea</Label>
                        {#if $form.name && $form.industry && $form.target_market && $form.idea_stage}
                            <div class="flex flex-row">
                                {#if autoComplete.undoCache[0].length > 0}
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div on:click={() => {handleUndoAC()}}>
                                        <Badge class="mb-2" href="#" border rounded color="red">Undo</Badge>
                                    </div>
                                {/if}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div on:click={() => {handleAutoComplete($form)}}>
                                    <Badge class="ml-2 mb-2" href="#" border rounded color="indigo">AI-Enhance 🪄</Badge>
                                </div>
                            </div>
                        {/if}
                    </div>
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
                    <div class="flex flex-row justify-between">
                    {#if data.user.config}
                        <Button on:click={() => {extraFormModal1 = true;  formModal = false; mainForm.submit();}} size="xs">More</Button>
                    {/if}
                    <Button on:click={() => {clearFields()}} size="xs" color="red">Clear</Button>
                    </div>
                {#if !data.user.config}
                    <P size="xs">By submitting, I agree to the terms of the <A class="font-bold" href="#">MBP© Privacy Policy</A></P>
                {/if}
                {#if !formvcaLoading}
                    <Button class="mb-10 mt-3" type="submit">{data.user.config ? "Save Changes" : "Submit"}</Button>
                {:else if formvcaLoading}
                    <Button class="mb-10 mt-3" type="button"><Spinner size={6} color="white"/></Button>
                {/if}
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
        <form id="mainForm" method="POST" autocomplete="off" action="?/add" use:extra1Enhance>
            <div class="grid gap-6 mb-6">
                <div>
                <Label for="bA" class="mb-2">Market research & strategy</Label>
                <Textarea id="bA" placeholder="Share a brief overview of the market research or validation conducted, feedback from potential customers, and your plans to reach your target audience and promote your product or service (e.g., social media, events)." rows="4" name="marketResearch" bind:value={$extra1Form.marketResearch} required />
                {#if $extra1Errors.marketResearch}
                    <Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$extra1Errors.marketResearch}</Helper>
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

<Modal bind:open={failModal} size="xs" permanent>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{outputObj.message}</h3>
        <Button color="red" class="mr-2" on:click={() => {$form = {}; failModal = false; resetForm.submit();}}>I Understand</Button>
    </div>
  </Modal>

  <form id="reset" method="POST" action="?/reset"></form>