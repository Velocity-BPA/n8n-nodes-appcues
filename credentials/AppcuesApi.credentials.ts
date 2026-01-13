/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AppcuesApi implements ICredentialType {
  name = 'appcuesApi';
  displayName = 'Appcues API';
  documentationUrl = 'https://docs.appcues.com/api/reference';
  properties: INodeProperties[] = [
    {
      displayName: 'Account ID',
      name: 'accountId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Appcues Account ID. Found in Studio > Settings > Account.',
      placeholder: 'e.g., 12345',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      required: true,
      description:
        'Your Appcues API Key. Create one in Studio > Settings > Integrations > API Keys.',
      placeholder: 'e.g., appcues_api_key_...',
    },
    {
      displayName: 'API Secret',
      name: 'apiSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Appcues API Secret. Shown only once when creating the API key.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization:
          '=Basic {{Buffer.from($credentials.apiKey + ":" + $credentials.apiSecret).toString("base64")}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '=https://api.appcues.com/v2/accounts/{{$credentials.accountId}}',
      url: '/segments',
      method: 'GET',
    },
  };
}
