import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AppcuesApi implements ICredentialType {
	name = 'appcuesApi';
	displayName = 'Appcues API';
	documentationUrl = 'https://docs.appcues.com/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for Appcues. Generate one in your Appcues dashboard under Settings > API Keys.',
			required: true,
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.appcues.com',
			description: 'Base URL for the Appcues API',
			required: true,
		},
	];
}