import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SocketIOApi implements ICredentialType {
	name = 'socketIOApi';
	displayName = 'SocketIO API';
	documentationUrl = 'https://socket.io/docs/v4/';
	properties: INodeProperties[] = [
		{
			displayName: 'JWT Token',
			name: 'jwtToken',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'The JWT token for SocketIO authentication',
		},
		{
			displayName: 'SocketIO Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'ws://localhost:3000',
			description: 'The URL of the SocketIO server',
		},
		{
			displayName: 'Namespace',
			name: 'namespace',
			type: 'string',
			default: '/',
			description: 'The SocketIO namespace to connect to',
		},
		{
			displayName: 'Auth Query Parameter',
			name: 'authQueryParam',
			type: 'string',
			default: 'token',
			description: 'The query parameter name for JWT token (default: token)',
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.jwtToken}}',
			},
			qs: {
				'={{$credentials.authQueryParam}}': '={{$credentials.jwtToken}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.serverUrl}}',
			url: '/socket.io/',
			method: 'GET',
		},
	};
}
