import { NAMEDOTCOM_KEY } from '$env/static/private'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
	runtime: 'edge',
	split: true
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!NAMEDOTCOM_KEY) {
			throw new Error('NAMEDOTCOM_KEY env variable not set')
		}

		const { domains } = await request.json()

		if (!domains) {
			throw new Error('No request data')
		}

        const domainsArray: string[] = Object.values(domains)
		const domainNames = domainsArray.map((domain: any) => 
            [`${domain.toLowerCase()}.com`, `${domain.toLowerCase()}.net`, `${domain.toLowerCase()}.org`]
        ).flat();

        const midPoint = Math.ceil(domainNames.length / 2)
        const domainNames1 = domainNames.slice(0, midPoint)
        const domainNames2 = domainNames.slice(midPoint)

		if (!domainNames1 && !domainNames2) {
			throw new Error('no domain names provided')
		}
		
		const domainRes1 = await fetch('https://api.name.com/v4/domains:checkAvailability', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${NAMEDOTCOM_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				domainNames: [...domainNames1]
			})
		})
        
        const domainRes2 = await fetch('https://api.name.com/v4/domains:checkAvailability', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${NAMEDOTCOM_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				domainNames: [...domainNames2]
			})
		})

		const domainData1 = await domainRes1.json()
        const domainData2 = await domainRes2.json()
        const results = [...domainData1.results, ...domainData2.results]

		if (!results) {
			throw new Error('error 132')
		}

        // Transform API results into a dictionary for easy lookup
        const resultsDict: {[key: string]: any} = {};
        results.forEach((result: any) => {
            resultsDict[result.domainName] = result;
        });

        const orderedResults: any[][] = [];
        domainsArray.forEach((domain: string) => {
            let group: any[] = [];
            ['com', 'net', 'org'].forEach((tld: string) => {
                let domainName = `${domain.toLowerCase()}.${tld}`;
                if (resultsDict[domainName]) {
                    group.push(resultsDict[domainName]);
                }
            });
            orderedResults.push(group);
        });
        console.log(orderedResults)
        console.log(orderedResults.length)
        return json({ orderedResults })
    } catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}