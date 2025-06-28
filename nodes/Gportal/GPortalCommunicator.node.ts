import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
// import { Wait } from 'n8n-nodes-base';?
const webhookPath = 'gportal/communicator';

export class GPortalCommunicator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal Communicator',
		name: 'gPortalCommunicator',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow via a custom webhook',
		defaults: {
			name: 'My Custom Webhook',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: webhookPath, // URL path: /webhook/myCustomWebhook
			},
		],
		properties: [],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		const data = {
			headers: req.headers,
			query: req.query,
			body: req.body,
		};

		res.status(200).json({ success: true, received: data });

		return {
			workflowData: [[]],
		};
	}
}
