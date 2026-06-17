import { IExecuteFunctions, INodeExecutionData, NodeApiError } from 'n8n-workflow';
import { apiRequest, getResults, isUsedAsAiTool, pollRunStatus } from './genericFunctions';
import { ACTOR_ID } from '../ApifyGoogleEvents.node';
import { buildActorInput } from '../ApifyGoogleEvents.properties';

export async function getDefaultBuild(this: IExecuteFunctions, actorId: string) {
	const defaultBuildResp = await apiRequest.call(this, {
		method: 'GET',
		uri: `/v2/acts/${actorId}/builds/default`,
	});
	if (!defaultBuildResp?.data) {
		throw new NodeApiError(this.getNode(), {
			message: `Could not fetch default build for Actor ${actorId}`,
		});
	}
	return defaultBuildResp.data;
}

export function getDefaultInputsFromBuild(build: any) {
	const buildInputProperties = build?.actorDefinition?.input?.properties;
	const defaultInput: Record<string, any> = {};
	if (buildInputProperties && typeof buildInputProperties === 'object') {
		for (const [key, property] of Object.entries(buildInputProperties)) {
			if (
				property &&
				typeof property === 'object' &&
				'prefill' in property &&
				(property as any).prefill !== undefined &&
				(property as any).prefill !== null
			) {
				defaultInput[key] = (property as any).prefill;
			}
		}
	}
	return defaultInput;
}

export async function runActorApi(
	this: IExecuteFunctions,
	actorId: string,
	mergedInput: Record<string, any>,
	qs: Record<string, any>,
) {
	return await apiRequest.call(this, {
		method: 'POST',
		uri: `/v2/acts/${actorId}/runs`,
		body: mergedInput,
		qs,
	});
}

/**
 * Shape a single event according to the chosen Output mode.
 * - simplified: a small, LLM-friendly object (also forced when used as an AI tool)
 * - selected: only the picked fields, using the Actor's own keys
 * - raw: the event untouched
 */
function shapeItem(
	item: Record<string, any>,
	mode: string,
	fields: string[],
): Record<string, any> {
	if (mode === 'raw') {
		return item;
	}
	if (mode === 'selected') {
		const picked: Record<string, any> = {};
		for (const field of fields) {
			if (field in item) {
				picked[field] = item[field];
			}
		}
		return picked;
	}
	// simplified
	const date = (item.date ?? {}) as Record<string, any>;
	const venue = item.venue as Record<string, any> | string | undefined;
	const venueName = venue && typeof venue === 'object' ? venue.name : venue;
	const address = Array.isArray(item.address) ? item.address.join(', ') : item.address;
	return {
		title: item.title,
		startDate: date.start_date,
		when: date.when,
		venue: venueName,
		address,
		link: item.link,
		description: item.description,
		image: item.image,
	};
}

/**
 * The Actor returns one dataset item per search page, each holding an
 * `events` array. Flatten to one event per n8n item.
 */
function flattenEvents(items: any[]): Record<string, any>[] {
	const events: Record<string, any>[] = [];
	for (const item of items) {
		const all = Array.isArray(item?.events) ? item.events : [];
		for (const e of all) {
			events.push(e);
		}
	}
	return events;
}

export async function runActor(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const build = await getDefaultBuild.call(this, ACTOR_ID);
	const defaultInput = getDefaultInputsFromBuild(build);
	const mergedInput = buildActorInput(this, i, defaultInput);

	const run = await runActorApi.call(this, ACTOR_ID, mergedInput, { waitForFinish: 0 });
	if (!run?.data?.id) {
		throw new NodeApiError(this.getNode(), {
			message: 'Run ID not found after starting the Actor',
		});
	}

	const runId = run.data.id;
	const datasetId = run.data.defaultDatasetId;
	await pollRunStatus.call(this, runId);
	const items = await getResults.call(this, datasetId);

	let mode = this.getNodeParameter('output', i, 'simplified') as string;
	if (isUsedAsAiTool(this.getNode().type)) {
		mode = 'simplified';
	}
	const fields = (this.getNodeParameter('fields', i, []) as string[]) ?? [];

	const events = flattenEvents(items);
	const shaped = events.map((event) => shapeItem(event, mode, fields));
	return this.helpers.returnJsonArray(shaped);
}
