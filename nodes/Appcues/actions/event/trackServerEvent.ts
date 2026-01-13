/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function trackServerEvent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const eventName = this.getNodeParameter('eventName', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		user_id: userId,
		name: eventName,
		timestamp: additionalFields.timestamp || Date.now(),
	};

	if (additionalFields.attributes) {
		body.attributes = parseJson(additionalFields.attributes as string, 'Attributes');
	}

	if (additionalFields.context) {
		body.context = parseJson(additionalFields.context as string, 'Context');
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/events/track', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
