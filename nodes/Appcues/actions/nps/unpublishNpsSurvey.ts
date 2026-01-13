/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function unpublishNpsSurvey(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const surveyId = this.getNodeParameter('surveyId', index) as string;

	const responseData = await appcuesApiRequest.call(this, 'POST', `/nps/surveys/${surveyId}/unpublish`);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
