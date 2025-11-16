import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class GPortalQueryVectorEmbedding implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal Query Vector Embedding',
		name: 'gPortalQueryVectorEmbedding',
		icon: {
			light: 'file:icons/textEmbedding.black.svg',
			dark: 'file:icons/textEmbedding.black.svg',
		},
		group: ['transform'],
		version: 1,
		description: 'Use this API to query knowledge base',
		defaults: {
			name: 'GPortal Query Vector Embedding',
		},
		usableAsTool: true,
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
				displayName: 'Query String',
				name: 'queryString',
				type: 'string',
				default: '',
				required: true,
				description: 'The query string to get vector embedding for',
			},
			{
				displayName: 'Num Candidates',
				name: 'numCandidates',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 100,
				description: 'Number of candidates to consider',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
				default: 10,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Entity Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Entity name to filter by',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Version number',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const queryString = this.getNodeParameter('queryString', i) as string;
				const numCandidates = this.getNodeParameter('numCandidates', i, 100) as number;
				const limit = this.getNodeParameter('limit', i, 10) as number;
				const name = this.getNodeParameter('name', i, '') as string;
				const version = this.getNodeParameter('version', i, 0) as number;

				const qs: IDataObject = {
					queryString,
					numCandidates,
					limit,
					version,
				};

				// Only add name to query string if provided
				if (name) {
					qs.name = name;
				}

				const endpoint = '/generic-entities/vector-embedding';
				const method: 'GET' = 'GET';

				const requestOptions: IHttpRequestOptions = {
					method,
					url: endpoint,
					qs,
				};

				// Log detailed request information for debugging
				const credentials = await this.getCredentials('gPortalApi');
				const baseURL = credentials?.domain || 'No base URL found';
				const fullURL = `${baseURL}${endpoint}`;

				this.logger.info('=== REQUEST DEBUG INFO ===');
				this.logger.info(`Base URL: ${baseURL}`);
				this.logger.info(`Endpoint: ${endpoint}`);
				this.logger.info(`Full URL: ${fullURL}`);
				this.logger.info(`Method: ${method}`);
				this.logger.info(`Query Parameters: ${JSON.stringify(qs)}`);
				this.logger.info('========================');

				// use this way to workaround Invalid URL if the sever isn't running at default port
				requestOptions.url = fullURL;
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
