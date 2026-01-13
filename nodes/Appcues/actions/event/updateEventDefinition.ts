/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function updateEventDefinition(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventId = this.getNodeParameter('eventId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.category) {
		body.category = updateFields.category;
	}

	if (updateFields.description) {
		body.description = updateFields.description;
	}

	if (updateFields.properties) {
		body.properties = parseJson(updateFields.properties as string, 'Properties');
	}

	const responseData = await appcuesApiRequest.call(this, 'PUT', `/events/${eventId}`, body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
