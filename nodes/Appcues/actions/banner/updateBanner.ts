/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function updateBanner(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const bannerId = this.getNodeParameter('bannerId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.content) {
		body.content = parseJson(updateFields.content as string, 'Content');
	}

	if (updateFields.position) {
		body.position = updateFields.position;
	}

	if (updateFields.targeting) {
		body.targeting = parseJson(updateFields.targeting as string, 'Targeting');
	}

	if (updateFields.backgroundColor) {
		body.background_color = updateFields.backgroundColor;
	}

	if (updateFields.textColor) {
		body.text_color = updateFields.textColor;
	}

	const responseData = await appcuesApiRequest.call(this, 'PUT', `/banners/${bannerId}`, body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
