import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
// import { Wait } from 'n8n-nodes-base';?
const webhookPath = 'gportal';

export class GPortalUIController implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal UI Controller',
		name: 'gPortalUIController',
		group: ['organization'],
		version: 1,
		description: 'GPortal UI Controller',
		defaults: {
			name: 'GPortal UI Controller',
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
						name: 'Create',
						value: 'create',
					},
					{
						name: 'Update',
						value: 'update',
					},
					{
						name: 'Delete',
						value: 'delete',
					},
				],
				default: 'create',
				description: 'The action to perform',
			},

			// Step 2: Show additional fields based on the selected action
			{
				displayName: 'Create Name',
				name: 'createName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['create'],
					},
				},
			},
			{
				displayName: 'Update ID',
				name: 'updateId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['update'],
					},
				},
			},
			{
				displayName: 'Delete ID',
				name: 'deleteId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['delete'],
					},
				},
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		this.logger.info('>>>>>>>>>>>>>>>>>webhook');
		// const resume = this.getNodeParameter('resume', 0) as string;

		return {
			workflowData: [
				[
					{
						json: {
							message: 'Hello World',
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

		this.sendMessageToUI('messsage heree');
		// let item: INodeExecutionData;
		// let myString: string;
		this.logger.info('before wait');
		await this.putExecutionToWait(new Date(Date.now() + 99999999999));

		this.logger.info('after wait');
		return [
			[
				{
					json: {
						executedNodeName: 'CreateEntity',
					},
				},
			],
		];
	}
}
