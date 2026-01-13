/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function searchGroups(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const searchQuery = this.getNodeParameter('searchQuery', index) as string;

	const body: IDataObject = {
		query: parseJson(searchQuery, 'Search Query'),
	};

	if (!returnAll) {
		const limit = this.getNodeParameter('limit', index) as number;
		body.limit = limit;
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/groups/search', body);

	const results = Array.isArray(responseData) ? responseData : responseData.results || [responseData];

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(results as IDataObject[]),
		{ itemData: { item: index } },
	);

	return executionData;
}
