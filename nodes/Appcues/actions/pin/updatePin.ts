/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function updatePin(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const pinId = this.getNodeParameter('pinId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.selector) {
		body.selector = updateFields.selector;
	}

	if (updateFields.content) {
		body.content = parseJson(updateFields.content as string, 'Content');
	}

	if (updateFields.targeting) {
		body.targeting = parseJson(updateFields.targeting as string, 'Targeting');
	}

	if (updateFields.position) {
		body.position = updateFields.position;
	}

	if (updateFields.pageUrl) {
		body.page_url = updateFields.pageUrl;
	}

	const responseData = await appcuesApiRequest.call(this, 'PUT', `/pins/${pinId}`, body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
