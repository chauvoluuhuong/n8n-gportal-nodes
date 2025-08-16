import type {
	INodePropertyOptions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function loadRootFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		// Get credentials
		const credentials = await this.getCredentials('gPortalApi');
		const baseURL = credentials?.domain || 'No base URL found';
		const fullURL = `${baseURL}/field-definitions/root-fields/meta-data`;

		this.logger.info('=== LOADING ROOT FIELDS DEBUG INFO ===');
		this.logger.info(`Base URL: ${baseURL}`);
		this.logger.info(`Full URL: ${fullURL}`);
		this.logger.info('====================================');

		// Make the API request
		const requestOptions: IHttpRequestOptions = {
			method: 'GET',
			url: fullURL,
			headers: {
				Authorization: `Bearer ${credentials?.token}`,
				Accept: 'application/json',
			},
		};

		const response = await this.helpers.httpRequest(requestOptions);
		this.logger.info(`Root fields response: ${JSON.stringify(response)}`);

		// Transform the response into the expected format
		const options: INodePropertyOptions[] = [];
		if (Array.isArray(response)) {
			for (const field of response) {
				options.push({
					name: field.name,
					value: field.name,
					description: `Version: ${field.version}, Unique: ${field.unique}`,
				});
			}
		}

		return options;
	} catch (error) {
		this.logger.error(`Error loading root fields: ${error.message}`);
		return [];
	}
}
