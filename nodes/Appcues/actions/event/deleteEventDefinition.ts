/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function deleteEventDefinition(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventId = this.getNodeParameter('eventId', index) as string;

	await appcuesApiRequest.call(this, 'DELETE', `/events/${eventId}`);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray({ success: true, eventId } as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
