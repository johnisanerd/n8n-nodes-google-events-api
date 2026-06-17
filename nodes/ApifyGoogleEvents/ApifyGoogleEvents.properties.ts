import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

/**
 * Build the Apify Actor input from node parameters.
 * Only the real Actor inputs are sent; the Output / Fields parameters shape the
 * data we return, they are not part of the Actor input. Optional fields are only
 * sent when the user provides a value so the Actor keeps its own defaults.
 */
export function buildActorInput(
	context: IExecuteFunctions,
	itemIndex: number,
	defaultInput: Record<string, any>,
): Record<string, any> {
	const input: Record<string, any> = {
		...defaultInput,
		q: context.getNodeParameter('q', itemIndex),
		max_pages: context.getNodeParameter('max_pages', itemIndex),
	};

	const location = context.getNodeParameter('location', itemIndex, '') as string;
	const gl = context.getNodeParameter('gl', itemIndex, '') as string;
	const hl = context.getNodeParameter('hl', itemIndex, '') as string;

	if (location) input.location = location;
	if (gl) input.gl = gl;
	if (hl) input.hl = hl;

	return input;
}

const resourceProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Event',
				value: 'event',
			},
		],
		default: 'event',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['event'],
			},
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search events for a query and location',
				description: 'Search events and return one item per event with date, venue, and ticket links',
			},
		],
		default: 'search',
	},
];

const actorProperties: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'q',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. concerts in Denver',
		description: 'What to search for, optionally including a place',
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'string',
		default: '',
		placeholder: 'e.g. Denver, Colorado, United States',
		description: 'Location to center the search on. Leave empty to use the query alone.',
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
	},
	{
		displayName: 'Country Code',
		name: 'gl',
		type: 'string',
		default: '',
		placeholder: 'e.g. us',
		description: 'Two-letter country code the search runs from',
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
	},
	{
		displayName: 'Language Code',
		name: 'hl',
		type: 'string',
		default: '',
		placeholder: 'e.g. en',
		description: 'Two-letter language code for the results',
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
	},
	{
		displayName: 'Maximum Pages',
		name: 'max_pages',
		type: 'number',
		default: 1,
		typeOptions: { minValue: 1 },
		description: 'How many result pages to fetch',
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
	},
];

const outputProperties: INodeProperties[] = [
	{
		displayName: 'Output',
		name: 'output',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['event'], operation: ['search'] } },
		options: [
			{
				name: 'Raw',
				value: 'raw',
				description: 'Return every field the API produces for each event',
			},
			{
				name: 'Selected Fields',
				value: 'selected',
				description: 'Choose exactly which fields to return',
			},
			{
				name: 'Simplified',
				value: 'simplified',
				description: 'Return a compact set of the most useful event fields',
			},
		],
		default: 'simplified',
		description: 'How much data to return for each event',
	},
	{
		displayName: 'Fields to Include',
		name: 'fields',
		type: 'multiOptions',
		displayOptions: {
			show: { resource: ['event'], operation: ['search'], output: ['selected'] },
		},
		options: [
			{ name: 'Address', value: 'address' },
			{ name: 'Date', value: 'date' },
			{ name: 'Description', value: 'description' },
			{ name: 'Event Location Map', value: 'event_location_map' },
			{ name: 'Image', value: 'image' },
			{ name: 'Link', value: 'link' },
			{ name: 'Ticket Info', value: 'ticket_info' },
			{ name: 'Title', value: 'title' },
			{ name: 'Venue', value: 'venue' },
		],
		default: ['title', 'date', 'address', 'link'],
		description: 'Which fields to return when Output is set to Selected Fields',
	},
];

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'API Key',
				value: 'apifyApi',
			},
			{
				name: 'OAuth2',
				value: 'apifyOAuth2Api',
			},
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const properties: INodeProperties[] = [
	...resourceProperties,
	...actorProperties,
	...outputProperties,
	...authenticationProperties,
];
