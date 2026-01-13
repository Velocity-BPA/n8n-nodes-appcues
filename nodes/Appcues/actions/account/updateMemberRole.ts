/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function updateMemberRole(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const memberId = this.getNodeParameter('memberId', index) as string;
	const role = this.getNodeParameter('role', index) as string;

	const body: IDataObject = {
		role,
	};

	const responseData = await appcuesApiRequest.call(this, 'PUT', `/members/${memberId}`, body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
