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
import { loadRootFields } from './services';
import { omit } from 'lodash';

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
			// {
			// 	name: 'default',
			// 	httpMethod: 'GET',
			// 	responseMode: 'onReceived',
			// 	path: webhookPath,
			// 	restartWebhook: true,
			// 	isFullPath: true,
			// },
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
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
				displayName: 'Entity Name or ID',
				name: 'entityName',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadRootFields',
				},
				default: '',
				displayOptions: {
					show: {
						action: ['createEntity'],
					},
				},
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '0',
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
			{
				displayName: 'Default Field Values',
				name: 'defaultFieldValues',
				type: 'json',
				default: '{}',
				description:
					'Default values for entity fields in JSON format. Can use <a href="https://docs.n8n.io/code/expressions/">expressions</a> for dynamic values.',
				displayOptions: {
					show: {
						action: ['createEntity', 'updateEntity'],
					},
				},
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// Get current execution ID and node name
		const currentExecutionId = this.getExecutionId();
		// const requestObject = this.getRequestObject();
		const params = this.getParamsData();
		const requestObject = this.getRequestObject();
		this.logger.info(`params: ${JSON.stringify(params)}`);
		this.logger.info(`requestObject: ${JSON.stringify(requestObject.body || {})}`);

		return {
			workflowData: [
				[
					{
						json: {
							executionId: currentExecutionId,
							/*
                after G-portal moving to next step, it will post the current result as
								 {
						        nodeExecutionsData: {
										[currentNodeName]: {
											entityName: entityName,
											entityId: entityId,
											version: version,
											defaultFieldValues: defaultFieldValues
										}
									}
								 }
							*/
							...(requestObject.body || {}),
						},
					},
				],
			],
		};
	}

	methods = {
		loadOptions: {
			loadRootFields: loadRootFields,
		},
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const context = this.getWorkflowDataProxy(0);
		const inputData = this.getInputData();

		// Get current execution ID and node name
		const currentExecutionId = this.getExecutionId();
		const currentNodeName = this.getNode().name;

		// Get node parameters with error handling
		const action = this.getNodeParameter('action', 0) as string;

		// Get conditional parameters based on action
		let entityName = '';
		let entityId = '';
		let version = '';
		let defaultFieldValues = {};

		try {
			if (action === 'createEntity') {
				entityName = this.getNodeParameter('entityName', 0) as string;
				version = this.getNodeParameter('version', 0) as string;
			} else if (action === 'updateEntity') {
				entityId = this.getNodeParameter('entityId', 0) as string;
			}

			// Get default field values (available for both actions)
			const defaultFieldValuesParam = this.getNodeParameter(
				'defaultFieldValues',
				0,
				'{}',
			) as string;
			try {
				defaultFieldValues = JSON.parse(defaultFieldValuesParam);
			} catch (parseError) {
				this.logger.warn(
					`Could not parse default field values JSON: ${parseError.message}. Using empty object.`,
				);
				defaultFieldValues = defaultFieldValuesParam;
			}
		} catch (error) {
			this.logger.warn(`Could not get some parameters: ${error.message}`);
		}

		context.$execution.customData.set('currentNodeName', currentNodeName);
		context.$execution.customData.set('executionId', this.getExecutionId());
		if (inputData.length > 0 && inputData[0].json.lastNodeExecuted) {
			context.$execution.customData.set(
				inputData[0].json.lastNodeExecuted,
				JSON.stringify(inputData[0].json),
			);
		}

		// let nodeExecutionsData: any = {};
		// if (typeof inputData[0].json?.nodeExecutionsData === 'object') {
		// 	nodeExecutionsData = inputData[0].json?.nodeExecutionsData;
		// }
		// Prepare the broadcast payload
		const broadcastPayload = {
			room: currentExecutionId,
			eventName: 'execute-ui-command',
			data: {
				currentStepName: currentNodeName,
				currentAction: action,
				workflowId: context.$workflow.id,
				executionId: currentExecutionId,
				nodeExecutionsData: {
					[currentNodeName]: {
						entityName: entityName,
						entityId: entityId,
						version: version,
						defaultFieldValues: defaultFieldValues,
					},

					...omit(inputData[0].json, [
						'body',
						'headers',
						'query',
						'params',
						'webhookUrl',
						'executionMode',
					]),
				},
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

		await this.putExecutionToWait(new Date(Date.now() + 99999999999));

		// the output is sent from webhook handler
		return [
			[
				{
					json: {},
				},
			],
		];
	}
}
