/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function createPin(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const selector = this.getNodeParameter('selector', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
		selector,
	};

	if (additionalFields.content) {
		body.content = parseJson(additionalFields.content as string, 'Content');
	}

	if (additionalFields.targeting) {
		body.targeting = parseJson(additionalFields.targeting as string, 'Targeting');
	}

	if (additionalFields.position) {
		body.position = additionalFields.position;
	}

	if (additionalFields.pageUrl) {
		body.page_url = additionalFields.pageUrl;
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/pins', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
