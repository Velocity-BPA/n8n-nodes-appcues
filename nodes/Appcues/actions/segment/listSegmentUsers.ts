/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequestAllItems } from '../../transport/GenericFunctions';

export async function listSegmentUsers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	let responseData;

	if (returnAll) {
		responseData = await appcuesApiRequestAllItems.call(
			this,
			'GET',
			`/segments/${segmentId}/users`,
			{},
		);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		responseData = await appcuesApiRequestAllItems.call(
			this,
			'GET',
			`/segments/${segmentId}/users`,
			{},
		);
		responseData = responseData.slice(0, limit);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{ itemData: { item: index } },
	);

	return executionData;
}
