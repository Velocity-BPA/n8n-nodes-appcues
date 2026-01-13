/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequestAllItems } from '../../transport/GenericFunctions';

export async function listEventDefinitions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const qs: IDataObject = {};

	if (additionalFields.category) {
		qs.category = additionalFields.category;
	}

	let responseData;

	if (returnAll) {
		responseData = await appcuesApiRequestAllItems.call(this, 'GET', '/events', qs);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		qs.limit = limit;
		responseData = await appcuesApiRequestAllItems.call(this, 'GET', '/events', qs);
		responseData = responseData.slice(0, limit);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{ itemData: { item: index } },
	);

	return executionData;
}
