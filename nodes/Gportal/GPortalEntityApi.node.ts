import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class GPortalEntityApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal Entity API',
		name: 'gPortalEntityApi',
		icon: 'fa:database',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with GPortal Entity API',
		defaults: {
			name: 'GPortal Entity API',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'gPortalApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.domain}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Entity',
						value: 'entity',
					},
				],
				default: 'entity',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['entity'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new entity',
						action: 'Create a new entity',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an entity',
						action: 'Delete an entity',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an entity by ID',
						action: 'Get an entity by ID',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many entities',
						action: 'Get many entities',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an entity',
						action: 'Update an entity',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['delete', 'get', 'update'],
						resource: ['entity'],
					},
				},
				description: 'The ID of the entity',
			},
			{
				displayName: 'Entity Data',
				name: 'entityData',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						resource: ['entity'],
					},
				},
				description: 'The entity data in JSON format',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Query Parameters',
						name: 'queryParameters',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						placeholder: 'Add Query Parameter',
						default: {},
						options: [
							{
								name: 'parameters',
								displayName: 'Parameters',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the parameter',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the parameter',
									},
								],
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

		let endpoint = '';
		let method: 'GET' | 'POST' | 'PUT' | 'DELETE';
		let body: IDataObject | string = {};

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'entity') {
					if (operation === 'create') {
						method = 'POST';
						endpoint = '/generic-entities';
						body = this.getNodeParameter('entityData', i) as string;
					} else if (operation === 'delete') {
						method = 'DELETE';
						const entityId = this.getNodeParameter('entityId', i) as string;
						endpoint = `/generic-entities/${entityId}`;
					} else if (operation === 'get') {
						method = 'GET';
						const entityId = this.getNodeParameter('entityId', i) as string;
						endpoint = `/generic-entities/${entityId}`;
					} else if (operation === 'getAll') {
						method = 'GET';
						endpoint = '/generic-entities';
					} else if (operation === 'update') {
						method = 'PUT';
						const entityId = this.getNodeParameter('entityId', i) as string;
						endpoint = `/generic-entities/${entityId}`;
						body = this.getNodeParameter('entityData', i) as string;
					} else {
						throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Resource ${resource} not supported`);
				}

				// Add query parameters if provided
				const qs: IDataObject = {};
				if (
					additionalFields.queryParameters &&
					typeof additionalFields.queryParameters === 'object'
				) {
					const queryParams = additionalFields.queryParameters as IDataObject;
					if (queryParams.parameters && Array.isArray(queryParams.parameters)) {
						for (const parameter of queryParams.parameters as IDataObject[]) {
							qs[parameter.name as string] = parameter.value;
						}
					}
				}

				const requestOptions: IHttpRequestOptions = {
					method,
					url: endpoint,
					qs,
				};

				this.logger.debug(`requestOptions: ${JSON.stringify(requestOptions)}`);

				if (method !== 'GET' && method !== 'DELETE') {
					requestOptions.body = body;
				}

				const response = await this.helpers.httpRequest(requestOptions);

				returnData.push({
					json: response,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
