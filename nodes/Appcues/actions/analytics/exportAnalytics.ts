/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';

export async function exportAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const dateFrom = this.getNodeParameter('dateFrom', index) as string;
	const dateTo = this.getNodeParameter('dateTo', index) as string;
	const exportType = this.getNodeParameter('exportType', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		date_from: dateFrom,
		date_to: dateTo,
		type: exportType,
	};

	if (additionalFields.flowIds) {
		body.flow_ids = additionalFields.flowIds;
	}

	if (additionalFields.segmentId) {
		body.segment_id = additionalFields.segmentId;
	}

	if (additionalFields.format) {
		body.format = additionalFields.format;
	}

	const responseData = await appcuesApiRequest.call(this, 'POST', '/analytics/export', body);

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: index } },
	);

	return executionData;
}
