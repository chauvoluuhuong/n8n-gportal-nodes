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
const webhookPath = '';

export type WebhookParameters = {
	httpMethod: string | string[];
	responseMode: string;
	responseData: string;
	responseCode?: number; //typeVersion <= 1.1
	options?: {
		responseData?: string;
		responseCode?: {
			values?: {
				responseCode: number;
				customCode?: number;
			};
		};
		noResponseBody?: boolean;
	};
};
export const getResponseCode = (parameters: WebhookParameters) => {
	if (parameters.responseCode) {
		return parameters.responseCode;
	}
	const responseCodeOptions = parameters.options;
	if (responseCodeOptions?.responseCode?.values) {
		const { responseCode, customCode } = responseCodeOptions.responseCode.values;

		if (customCode) {
			return customCode;
		}

		return responseCode;
	}
	return 200;
};

export const getResponseData = (parameters: WebhookParameters) => {
	const { responseData, responseMode, options } = parameters;
	if (responseData) return responseData;

	if (responseMode === 'onReceived') {
		const data = options?.responseData;
		if (data) return data;
	}

	if (options?.noResponseBody) return 'noData';

	return undefined;
};

export class CreateEntityNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Create Entity',
		name: 'createEntity',
		group: ['organization'],
		version: 1,
		description: 'Basic Example Node',
		defaults: {
			name: 'Example Node',
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
				responseMode: '={{$parameter["responseMode"]}}',
				responseData: '={{$parameter["responseMode"] === "lastNode" ? "noData" : undefined}}',
				path: webhookPath,
				restartWebhook: true,
				isFullPath: true,
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'My String',
				name: 'myString',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The description text',
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
		// const items = this.getInputData();

		// let item: INodeExecutionData;
		// let myString: string;
		this.logger.info('before wait');
		await this.putExecutionToWait(new Date(Date.now() + 99999999999));
		this.logger.info('after wait');
		return [[]];
	}
}
