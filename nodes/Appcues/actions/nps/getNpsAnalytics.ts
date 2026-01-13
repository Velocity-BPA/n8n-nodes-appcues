/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function getNpsAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const surveyId = this.getNodeParameter('surveyId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const qs: IDataObject = {};

	if (additionalFields.dateFrom) {
		qs.date_from = additionalFields.dateFrom;
	}

	if (additionalFields.dateTo) {
		qs.date_to = additionalFields.dateTo;
	}

	if (additionalFields.granularity) {
		qs.granularity = additionalFields.granularity;
	}

	const responseData = await appcuesApiRequest.call(
		this,
		'GET',
		`/nps/surveys/${surveyId}/analytics`,
		undefined,
		qs,
	);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
