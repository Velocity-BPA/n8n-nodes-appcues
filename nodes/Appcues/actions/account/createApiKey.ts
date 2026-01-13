/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function createApiKey(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const keyName = this.getNodeParameter('keyName', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as string;

	const body: IDataObject = {
		name: keyName,
		permissions,
	};

	const responseData = await appcuesApiRequest.call(this, 'POST', '/api-keys', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
