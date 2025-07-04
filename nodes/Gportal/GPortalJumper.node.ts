import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class GPortalJumper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPortal Jumper',
		name: 'gPortalJumper',
		icon: 'file:gportal.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Direct Jump by Input Node',
		description: 'Jump to different outputs based on input node name',
		defaults: {
			name: 'GPortal Jumper',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Source Node Name',
				name: 'sourceNodeName',
				type: 'string',
				default: '',
				description: 'Name of the source node (leave empty to use default output)',
			},
			{
				displayName: 'Target Output',
				name: 'targetOutput',
				type: 'number',
				default: 0,
				description: 'Output index to route data to (0-based)',
			},
			{
				displayName: 'Default Output',
				name: 'defaultOutput',
				type: 'number',
				default: 0,
				description: 'Default output index if no mapping matches',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Log Jumps',
						name: 'logJumps',
						type: 'boolean',
						default: true,
						description: 'Whether to log jump decisions',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const sourceNodeName = this.getNodeParameter('sourceNodeName', 0) as string;
		const targetOutput = this.getNodeParameter('targetOutput', 0) as number;
		const defaultOutput = this.getNodeParameter('defaultOutput', 0) as number;
		const options = this.getNodeParameter('options', 0) as IDataObject;
		const logJumps = options.logJumps !== false;

		// Initialize output arrays
		const outputs: INodeExecutionData[][] = [];
		const outputCount = 2; // Default to 2 outputs

		// Initialize all output arrays
		for (let i = 0; i < outputCount; i++) {
			outputs[i] = [];
		}

		// Determine which output to use
		let finalOutput = defaultOutput;
		if (sourceNodeName && sourceNodeName.trim() !== '') {
			finalOutput = targetOutput;
		}

		// Ensure output is valid
		if (finalOutput >= outputCount) {
			finalOutput = 0;
		}

		for (let i = 0; i < items.length; i++) {
			try {
				// Log the jump decision
				if (logJumps) {
					this.logger.info(
						`Item ${i}: Routing to Output ${finalOutput} (Source: "${sourceNodeName}")`,
					);
				}

				// Add item to target output
				outputs[finalOutput].push(items[i]);
			} catch (error) {
				if (this.continueOnFail()) {
					this.logger.error(`Error processing item ${i}: ${error.message}`);
					// Send to default output on error
					outputs[defaultOutput].push(items[i]);
					continue;
				}
				throw error;
			}
		}

		return outputs;
	}
}
