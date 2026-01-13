/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, buildQueryParams } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getRecentEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const userId = this.getNodeParameter('userId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query = buildQueryParams({
    limit: additionalFields.limit,
    offset: additionalFields.offset,
    from: additionalFields.dateFrom,
    to: additionalFields.dateTo,
  });

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/users/${encodeURIComponent(userId)}/events`,
    undefined,
    query,
  );

  if (Array.isArray(response)) {
    return prepareExecutionData(response, { item: index });
  }

  return prepareExecutionData(response as IDataObject, { item: index });
}
