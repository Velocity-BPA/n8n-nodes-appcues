/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest, parseJson } from '../../transport/GenericFunctions';

export async function createNpsSurvey(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
	};

	if (additionalFields.question) {
		body.question = additionalFields.question;
	}

	if (additionalFields.followUpQuestion) {
		body.follow_up_question = additionalFields.followUpQuestion;
	}

	if (additionalFields.targeting) {
		body.targeting = parseJson(additionalFields.targeting as string, 'Targeting');
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/nps/surveys', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
