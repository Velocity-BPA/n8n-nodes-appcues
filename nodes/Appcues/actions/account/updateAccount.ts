/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function updateAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.timezone) {
		body.timezone = updateFields.timezone;
	}

	if (updateFields.defaultLocale) {
		body.default_locale = updateFields.defaultLocale;
	}

	const responseData = await appcuesApiRequest.call(this, 'PUT', '', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
