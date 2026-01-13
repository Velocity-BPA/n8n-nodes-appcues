/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function deleteApiKey(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const apiKeyId = this.getNodeParameter('apiKeyId', index) as string;

	await appcuesApiRequest.call(this, 'DELETE', `/api-keys/${apiKeyId}`);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray({ success: true, apiKeyId } as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
