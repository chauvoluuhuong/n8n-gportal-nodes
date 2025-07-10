import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
// import { Wait } from 'n8n-nodes-base';?
const webhookPath = 'gportal';

export class GPortalUiController implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal UI Controller',
		name: 'gPortalUiController',
		icon: {
			light: 'file:icons/uiController.white.svg',
			dark: 'file:icons/uiController.black.svg',
		},
		group: ['organization'],
		version: 1,
		description: 'GPortal UI Controller',
		defaults: {
			name: 'GPortal UI Controller',
		},
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
		webhooks: [
			{
				name: 'default',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: webhookPath,
				restartWebhook: true,
				isFullPath: true,
			},
			{
				name: 'default',
				httpMethod: 'POST',
				// responseMode: '={{$parameter["responseMode"]}}',
				// responseData: '={{$parameter["responseMode"] === "lastNode" ? "noData" : undefined}}',
				path: webhookPath,
				restartWebhook: true,
				isFullPath: true,
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Step 1: Define the "Action" dropdown
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Create Entity',
						value: 'createEntity',
					},

					{
						name: 'Update Entity',
						value: 'updateEntity',
					},
				],
				default: 'createEntity',
				description: 'Create Entity',
			},
			{
				displayName: 'Entity Name',
				name: 'entityName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['createEntity'],
					},
				},
				description: 'The name of the entity to create',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['createEntity'],
					},
				},
				description: 'The version of the entity to create',
			},
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['updateEntity'],
					},
				},
				description: 'The ID of the entity to update',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// Get current execution ID and node name
		const currentExecutionId = this.getExecutionId();
		const currentNodeName = this.getNode().name;

		// // Prepare the broadcast payload
		// const broadcastPayload = {
		// 	room: currentExecutionId,
		// 	eventName: 'execute-ui-command',
		// 	data: {
		// 		currentStepName: currentNodeName,
		// 	},
		// };

		// try {
		// 	// Get credentials
		// 	const credentials = await this.getCredentials('gPortalApi');
		// 	const baseURL = credentials?.domain || 'No base URL found';
		// 	const fullURL = `${baseURL}/socket/broadcast`;

		// 	this.logger.info('=== BROADCAST REQUEST DEBUG INFO ===');
		// 	this.logger.info(`Base URL: ${baseURL}`);
		// 	this.logger.info(`Full URL: ${fullURL}`);
		// 	this.logger.info(`Payload: ${JSON.stringify(broadcastPayload)}`);
		// 	this.logger.info('====================================');

		// 	// Make the broadcast request
		// 	const requestOptions: IHttpRequestOptions = {
		// 		method: 'POST',
		// 		url: fullURL,
		// 		body: broadcastPayload,
		// 		headers: {
		// 			Authorization: `Bearer ${credentials?.token}`,
		// 			'Content-Type': 'application/json',
		// 			Accept: 'application/json',
		// 		},
		// 	};

		// 	const response = await this.helpers.httpRequest(requestOptions);
		// 	this.logger.info(`Broadcast response: ${JSON.stringify(response)}`);
		// } catch (error) {
		// 	this.logger.error(`Error broadcasting to socket: ${error.message}`);
		// 	// Continue execution even if broadcast fails
		// }

		return {
			workflowData: [
				[
					{
						json: {
							message: 'Broadcast sent successfully',
							executionId: currentExecutionId,
							nodeName: currentNodeName,
							broadcastSent: true,
						},
					},
				],
			],
		};
	}

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const context = this.getWorkflowDataProxy(0);

		// const items = this.getInputData();
		// const executeData = this.getExecuteData();
		// this.logger.info('executeData', executeData);
		this.logger.info(`executeData: ${JSON.stringify(context.$execution.customData.getAll())}`);

		// Get current execution ID and node name
		const currentExecutionId = this.getExecutionId();
		const currentNodeName = this.getNode().name;

		// Prepare the broadcast payload
		const broadcastPayload = {
			room: currentExecutionId,
			eventName: 'execute-ui-command',
			data: {
				currentStepName: currentNodeName,
			},
		};

		try {
			// Get credentials
			const credentials = await this.getCredentials('gPortalApi');
			const baseURL = credentials?.domain || 'No base URL found';
			const fullURL = `${baseURL}/socket/broadcast`;

			this.logger.info('=== BROADCAST REQUEST DEBUG INFO ===');
			this.logger.info(`Base URL: ${baseURL}`);
			this.logger.info(`Full URL: ${fullURL}`);
			this.logger.info(`Payload: ${JSON.stringify(broadcastPayload)}`);
			this.logger.info('====================================');

			// Make the broadcast request
			const requestOptions: IHttpRequestOptions = {
				method: 'POST',
				url: fullURL,
				body: broadcastPayload,
				headers: {
					Authorization: `Bearer ${credentials?.token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			};

			const response = await this.helpers.httpRequest(requestOptions);
			this.logger.info(`Broadcast response: ${JSON.stringify(response)}`);
		} catch (error) {
			this.logger.error(`Error broadcasting to socket: ${error.message}`);
			// Continue execution even if broadcast fails
		}

		// let item: INodeExecutionData;
		// let myString: string;
		this.logger.info('before wait');
		await this.putExecutionToWait(new Date(Date.now() + 99999999999));
		this.logger.info('after wait');

		context.$execution.customData.set('currentNodeName', currentNodeName);
		context.$execution.customData.set('executionId', this.getExecutionId());

		return [
			[
				{
					json: {
						currentNodeName: currentNodeName,
						executionId: this.getExecutionId(),
					},
				},
			],
		];
	}
}
