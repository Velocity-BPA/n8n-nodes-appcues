/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import {
  APPCUES_API_BASE_URL,
  APPCUES_HTTP_API_BASE_URL,
  APPCUES_LICENSING_NOTICE,
} from '../constants/constants';
import type { IAppcuesCredentials, IAppcuesApiError } from '../types/AppcuesTypes';

let licensingNoticeLogged = false;

/**
 * Log the licensing notice once per node load
 */
export function logLicensingNotice(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): void {
  if (!licensingNoticeLogged) {
    context.logger.warn(APPCUES_LICENSING_NOTICE);
    licensingNoticeLogged = true;
  }
}

/**
 * Get Appcues credentials from the node
 */
export async function getAppcuesCredentials(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): Promise<IAppcuesCredentials> {
  const credentials = await context.getCredentials('appcuesApi');
  return {
    accountId: credentials.accountId as string,
    apiKey: credentials.apiKey as string,
    apiSecret: credentials.apiSecret as string,
  };
}

/**
 * Create Basic Auth header from API key and secret
 */
export function createBasicAuthHeader(apiKey: string, apiSecret: string): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
}

/**
 * Make a request to the Appcues V2 API
 */
export async function appcuesApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  options?: Partial<IHttpRequestOptions>,
): Promise<any> {
  logLicensingNotice(this);

  const credentials = await getAppcuesCredentials(this);
  const authHeader = createBasicAuthHeader(credentials.apiKey, credentials.apiSecret);

  const requestOptions: IHttpRequestOptions = {
    method,
    url: `${APPCUES_API_BASE_URL}/accounts/${credentials.accountId}${endpoint}`,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    json: true,
    ...options,
  };

  if (query && Object.keys(query).length > 0) {
    requestOptions.qs = query;
  }

  if (body && Object.keys(body).length > 0) {
    requestOptions.body = body;
  }

  try {
    const response = await this.helpers.httpRequest(requestOptions);
    return response;
  } catch (error: any) {
    throw handleAppcuesError(this, error);
  }
}

/**
 * Make a request to the Appcues HTTP API (V1) for real-time activity
 */
export async function appcuesHttpApiRequest(
  this: IExecuteFunctions,
  userId: string,
  body: IDataObject,
): Promise<any> {
  logLicensingNotice(this);

  const credentials = await getAppcuesCredentials(this);

  const requestOptions: IHttpRequestOptions = {
    method: 'POST',
    url: `${APPCUES_HTTP_API_BASE_URL}/accounts/${credentials.accountId}/users/${encodeURIComponent(userId)}/activity`,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    json: true,
  };

  try {
    const response = await this.helpers.httpRequest(requestOptions);
    return response;
  } catch (error: any) {
    throw handleAppcuesError(this, error);
  }
}

/**
 * Make a bulk import request with NDJSON format
 */
export async function appcuesBulkImportRequest(
  this: IExecuteFunctions,
  endpoint: string,
  data: IDataObject[],
): Promise<any> {
  logLicensingNotice(this);

  const credentials = await getAppcuesCredentials(this);
  const authHeader = createBasicAuthHeader(credentials.apiKey, credentials.apiSecret);

  // Convert to NDJSON format (newline-delimited JSON)
  const ndjson = data.map((item) => JSON.stringify(item)).join('\n');

  const requestOptions: IHttpRequestOptions = {
    method: 'POST',
    url: `${APPCUES_API_BASE_URL}/accounts/${credentials.accountId}${endpoint}`,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-ndjson',
    },
    body: ndjson,
  };

  try {
    const response = await this.helpers.httpRequest(requestOptions);
    return response;
  } catch (error: any) {
    throw handleAppcuesError(this, error);
  }
}

/**
 * Make paginated requests to the Appcues API
 */
export async function appcuesApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  dataKey?: string,
): Promise<any[]> {
  const returnData: any[] = [];
  let responseData: any;
  let cursor: string | undefined;

  do {
    const queryParams: IDataObject = { ...query };
    if (cursor) {
      queryParams.cursor = cursor;
    }

    responseData = await appcuesApiRequest.call(this, method, endpoint, body, queryParams);

    if (dataKey && responseData[dataKey]) {
      returnData.push(...responseData[dataKey]);
    } else if (Array.isArray(responseData)) {
      returnData.push(...responseData);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      returnData.push(...responseData.data);
    } else {
      returnData.push(responseData);
    }

    cursor = responseData.pagination?.cursor;
  } while (cursor && responseData.pagination?.has_more);

  return returnData;
}

/**
 * Handle Appcues API errors
 */
export function handleAppcuesError(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  error: any,
): NodeApiError | NodeOperationError {
  let errorMessage = 'An unknown error occurred';
  let statusCode = 500;
  let errorDescription = '';

  if (error.response) {
    const responseData = error.response.body as IAppcuesApiError;
    statusCode = error.response.statusCode || responseData?.status_code || 500;

    if (responseData?.message) {
      errorMessage = responseData.message.title || 'API Error';
      errorDescription = responseData.message.description || '';
    } else if (typeof error.message === 'string') {
      errorMessage = error.message;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  const errorDetails: JsonObject = {
    message: errorMessage,
    description: errorDescription,
    statusCode,
  };

  switch (statusCode) {
    case 400:
      errorDetails.message = 'Bad Request';
      errorDetails.description = errorDescription || 'The request was malformed or invalid.';
      break;
    case 401:
      errorDetails.message = 'Unauthorized';
      errorDetails.description =
        errorDescription || 'Invalid API credentials. Please check your API key and secret.';
      break;
    case 403:
      errorDetails.message = 'Forbidden';
      errorDetails.description =
        errorDescription ||
        'You do not have permission to access this resource. Check your API key permissions.';
      break;
    case 404:
      errorDetails.message = 'Not Found';
      errorDetails.description = errorDescription || 'The requested resource was not found.';
      break;
    case 422:
      errorDetails.message = 'Unprocessable Entity';
      errorDetails.description =
        errorDescription || 'The request was valid but could not be processed.';
      break;
    case 429:
      errorDetails.message = 'Rate Limited';
      errorDetails.description =
        errorDescription || 'Too many requests. Please wait before making more requests.';
      break;
    case 500:
      errorDetails.message = 'Server Error';
      errorDetails.description =
        errorDescription || 'An internal server error occurred on Appcues.';
      break;
  }

  return new NodeApiError(context.getNode(), error as JsonObject, errorDetails);
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(
  data: IDataObject,
  requiredFields: string[],
  context: IExecuteFunctions,
  itemIndex: number,
): void {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new NodeOperationError(
        context.getNode(),
        `The "${field}" field is required but was not provided.`,
        { itemIndex },
      );
    }
  }
}

/**
 * Parse JSON string or return object as-is
 */
export function parseJsonParameter(
  value: string | IDataObject | undefined,
  parameterName: string,
  context: IExecuteFunctions,
  itemIndex: number,
): IDataObject {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value) as IDataObject;
  } catch {
    throw new NodeOperationError(
      context.getNode(),
      `The "${parameterName}" field contains invalid JSON.`,
      { itemIndex },
    );
  }
}

/**
 * Simple JSON parser (throws generic error on parse failure)
 */
export function parseJson(
  value: string | IDataObject | undefined,
  fieldName: string,
): IDataObject {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value) as IDataObject;
  } catch {
    throw new Error(`The "${fieldName}" field contains invalid JSON.`);
  }
}

/**
 * Convert timestamp to ISO string
 */
export function toIsoTimestamp(
  value: string | number | Date | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  // Check if it's already an ISO string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  return value;
}

/**
 * Build query parameters from options
 */
export function buildQueryParams(options: IDataObject): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== '' && value !== null) {
      query[key] = value;
    }
  }

  return query;
}
