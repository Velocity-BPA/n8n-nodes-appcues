/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function previewFlow(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const flowId = this.getNodeParameter('flowId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const qs: IDataObject = {};

	if (additionalFields.userId) {
		qs.user_id = additionalFields.userId;
	}

	const responseData = await appcuesApiRequest.call(
		this,
		'GET',
		`/flows/${flowId}/preview`,
		undefined,
		qs,
	);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
