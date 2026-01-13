/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { parseJson } from '../../transport/GenericFunctions';

export async function createEventDefinition(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
	};

	if (additionalFields.category) {
		body.category = additionalFields.category;
	}

	if (additionalFields.description) {
		body.description = additionalFields.description;
	}

	if (additionalFields.properties) {
		body.properties = parseJson(additionalFields.properties as string, 'Properties');
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/events', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
