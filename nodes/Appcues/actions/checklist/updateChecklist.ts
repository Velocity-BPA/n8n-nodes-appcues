/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function updateChecklist(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const checklistId = this.getNodeParameter('checklistId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.items) {
		body.items = parseJson(updateFields.items as string, 'Items');
	}

	if (updateFields.targeting) {
		body.targeting = parseJson(updateFields.targeting as string, 'Targeting');
	}

	if (updateFields.appearance) {
		body.appearance = parseJson(updateFields.appearance as string, 'Appearance');
	}

	const responseData = await appcuesApiRequest.call(this, 'PUT', `/checklists/${checklistId}`, body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
