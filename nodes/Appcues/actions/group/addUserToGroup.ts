/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function addUserToGroup(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const groupId = this.getNodeParameter('groupId', index) as string;
	const userId = this.getNodeParameter('userId', index) as string;

	const body: IDataObject = {
		user_id: userId,
	};

	const responseData = await appcuesApiRequest.call(
		this,
		'POST',
		`/groups/${encodeURIComponent(groupId)}/users`,
		body,
	);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
