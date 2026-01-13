/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, buildQueryParams } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getFlowAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const flowId = this.getNodeParameter('flowId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query = buildQueryParams({
    from: additionalFields.dateFrom,
    to: additionalFields.dateTo,
    granularity: additionalFields.granularity,
  });

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/flows/${encodeURIComponent(flowId)}/analytics`,
    undefined,
    query,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
