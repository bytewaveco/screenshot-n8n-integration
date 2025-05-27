import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class Trbo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TRBO',
		name: 'trbo',
		icon: 'file:trbo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the TRBO API',
		defaults: {
			name: 'TRBO',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'trboApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://trbo.link/api',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Link',
						value: 'createLink',
						action: 'Create link',
						description: 'Create a link',
						routing: {
							request: {
								method: 'POST',
								url: '/profile/auto/link',
								body: {
									alias: '={{ $parameter.alias }}',
									url: '={{ $parameter.urlCreate }}',
									metadata: {
										public: '={{ $parameter.public }}',
										hidden: '={{ $parameter.hidden }}',
										unsearchable: '={{ $parameter.unsearchable }}',
									},
								},
							},
						},
					},
					{
						name: 'Delete Link',
						value: 'deleteLink',
						action: 'Delete link',
						description: 'Delete a link by ID',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/profile/auto/link/{{$parameter.linkIdDelete}}',
							},
						},
					},
					{
						name: 'Get Link Metrics',
						value: 'getLinkMetrics',
						action: 'Get profile link metrics',
						description: 'List link metrics for this profile',
						routing: {
							request: {
								method: 'GET',
								url: '/link-metrics',
							},
							send: {
								preSend: [
									async function (requestOptions) {
										const params = this.getNodeParameter('queryParameters.parameters', []);
										if (Array.isArray(params)) {
											requestOptions.qs ??= {};
											for (const param of params) {
												if (param.key) {
													requestOptions.qs[param.key] = param.value;
												}
											}
										}
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Get Links',
						value: 'getLinks',
						action: 'Get profile links',
						description: 'List links owned by this profile',
						routing: {
							request: {
								method: 'GET',
								url: '/links',
							},
							send: {
								preSend: [
									async function (requestOptions) {
										const params = this.getNodeParameter('queryParameters.parameters', []);
										if (Array.isArray(params)) {
											requestOptions.qs ??= {};
											for (const param of params) {
												if (param.key) {
													requestOptions.qs[param.key] = param.value;
												}
											}
										}
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Get Public Links',
						value: 'getPublicLinks',
						action: 'Get public links',
						description: 'List links that are publicly accessible',
						routing: {
							request: {
								method: 'GET',
								url: '/public/links',
							},
							send: {
								preSend: [
									async function (requestOptions) {
										const params = this.getNodeParameter('queryParameters.parameters', []);
										if (Array.isArray(params)) {
											requestOptions.qs ??= {};
											for (const param of params) {
												if (param.key) {
													requestOptions.qs[param.key] = param.value;
												}
											}
										}
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Get Public Profiles',
						value: 'getPublicProfiles',
						action: 'Get public profiles',
						description: 'List profiles that are publicly accessible',
						routing: {
							request: {
								method: 'GET',
								url: '/public/profiles',
							},
							send: {
								preSend: [
									async function (requestOptions) {
										const params = this.getNodeParameter('queryParameters.parameters', []);
										if (Array.isArray(params)) {
											requestOptions.qs ??= {};
											for (const param of params) {
												if (param.key) {
													requestOptions.qs[param.key] = param.value;
												}
											}
										}
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Search',
						value: 'getPublicSearch',
						action: 'Search',
						description: 'Search public profiles and links',
						routing: {
							request: {
								method: 'GET',
								url: '/public/search',
							},
							send: {
								preSend: [
									async function (requestOptions) {
										const params = this.getNodeParameter('queryParameters.parameters', []);
										if (Array.isArray(params)) {
											requestOptions.qs ??= {};
											for (const param of params) {
												if (param.key) {
													requestOptions.qs[param.key] = param.value;
												}
											}
										}
										const searchQuery = this.getNodeParameter('searchQuery', '');
										if (searchQuery) {
											requestOptions.qs = requestOptions.qs || {};
											requestOptions.qs.query = searchQuery;
										}
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Update Link',
						value: 'updateLink',
						action: 'Update link',
						description: 'Update a link by ID',
						routing: {
							request: {
								method: 'PUT',
								url: '=/profile/auto/link/{{$parameter.linkIdUpdate}}',
								body: {
									alias: '={{ $parameter.alias && $parameter.alias !== "" ? $parameter.alias : undefined }}',
									url: '={{ $parameter.urlUpdate && $parameter.urlUpdate !== "" ? $parameter.urlUpdate : undefined }}',
									metadata: {
										public: '={{ $parameter.public }}',
										hidden: '={{ $parameter.hidden }}',
										unsearchable: '={{ $parameter.unsearchable }}',
									},
								},
							},
						},
					},
				],
				default: 'getPublicSearch',
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				description: 'Query string for public search',
				displayOptions: {
					show: {
						operation: ['getPublicSearch'],
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'fixedCollection',
				placeholder: 'Add Query Parameter',
				default: {},
				typeOptions: { multipleValues: true },
				options: [
					{
						name: 'parameters',
						displayName: 'Parameters',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: [
							'getLinks',
							'getLinkMetrics',
							'getPublicLinks',
							'getPublicSearch',
							'getPublicProfiles',
						],
					},
				},
			},
			{
				displayName: 'Link ID',
				name: 'linkIdUpdate',
				type: 'string',
				default: '',
				description: 'The ID of the link to update',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateLink'],
					},
				},
			},
			{
				displayName: 'Link ID',
				name: 'linkIdDelete',
				type: 'string',
				default: '',
				description: 'The ID of the link to delete',
				required: true,
				displayOptions: {
					show: {
						operation: ['deleteLink'],
					},
				},
			},
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				default: '',
				description: 'Alias for the link',
				displayOptions: {
					show: {
						operation: ['createLink', 'updateLink'],
					},
				},
			},
			{
				displayName: 'URL',
				name: 'urlCreate',
				type: 'string',
				default: '',
				description: 'URL for the link',
				required: true,
				displayOptions: {
					show: {
						operation: ['createLink'],
					},
				},
			},
			{
				displayName: 'URL',
				name: 'urlUpdate',
				type: 'string',
				default: '',
				description: 'URL for the link',
				displayOptions: {
					show: {
						operation: ['updateLink'],
					},
				},
			},
			{
				displayName: 'Public',
				name: 'public',
				type: 'boolean',
				default: true,
				description: 'Whether the link is public',
				displayOptions: {
					show: {
						operation: ['createLink', 'updateLink'],
					},
				},
			},
			{
				displayName: 'Hidden',
				name: 'hidden',
				type: 'boolean',
				default: false,
				description: 'Whether the link is hidden',
				displayOptions: {
					show: {
						operation: ['createLink', 'updateLink'],
					},
				},
			},
			{
				displayName: 'Unsearchable',
				name: 'unsearchable',
				type: 'boolean',
				default: false,
				description: 'Whether the link is unsearchable',
				displayOptions: {
					show: {
						operation: ['createLink', 'updateLink'],
					},
				},
			},
		],
	};
}
