import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GPortalApi implements ICredentialType {
	name = 'gPortalApi';
	displayName = 'GPortal API';
	documentationUrl = 'https://your-docs-url';
	properties: INodeProperties[] = [
		{
			displayName: 'Bearer Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'The bearer token for authentication',
		},
		{
			displayName: 'Base URL',
			name: 'domain',
			type: 'string',
			default: 'http://103.124.95.129:8080/api/v1',
			description: 'The base URL of the GPortal API',
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain}}',
			url: '/auth/profile',
		},
	};
}
