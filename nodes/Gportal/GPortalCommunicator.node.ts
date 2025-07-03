import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class GPortalCommunicator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal Communicator',
		name: 'gPortalCommunicator',
		icon: 'fa:broadcast-tower',
		group: ['trigger'],
		version: 1,
		subtitle: '= {{$parameter["path"]}}',
		description: 'Starts a workflow when a custom REST API endpoint is called',
		defaults: {
			name: 'REST API Trigger',
		},
		// No inputs for a trigger node
		inputs: [],
		// We define one output, which will contain the data from the API call
		outputs: [NodeConnectionType.Main],
		// We don't need credentials for this simple example
		credentials: [],
		// This defines the core behavior of the trigger
		webhooks: [
			{
				name: 'default', // The name of the webhook definition
				httpMethod: 'POST', // We'll listen for POST requests. Can be GET, PUT, etc.
				responseMode: 'onReceived', // Send response immediately, don't wait for workflow to finish
				path: '={{$parameter["path"]}}', // The URL path will be defined by a parameter in the UI
			},
		],
		properties: [
			// This property will be displayed in the n8n UI for the user to configure
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'my-custom-endpoint',
				required: true,
				placeholder: 'my-custom-endpoint',
				description:
					'The URL path to listen on. The full URL will be displayed after activating the workflow.',
			},
		],
	};

	// The webhook method is the function that n8n executes when your endpoint is called.
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// req = The incoming HTTP Request object (like in Express.js)
		// res = The outgoing HTTP Response object
		const req = this.getRequestObject();

		// We want to return the request body, headers, and query parameters
		// to the workflow so they can be used in subsequent nodes.
		const responseData = {
			headers: req.headers,
			params: req.params,
			query: req.query,
			body: req.body,
		};

		// const res = this.getResponseObject();

		// The data must be returned in a special n8n structure.
		// It's an array of objects, where each object has a 'json' key.
		// This becomes the output of the node.
		const workflowData = [
			[
				{
					json: responseData,
				},
			],
		];

		// This tells n8n to start the workflow with the data we prepared.
		return {
			noWebhookResponse: true,
			workflowData,
		};
	}
}
