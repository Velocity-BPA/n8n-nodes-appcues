/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, buildQueryParams } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function listJobs(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query = buildQueryParams({
    status: additionalFields.status,
    type: additionalFields.type,
    limit: additionalFields.limit,
    offset: additionalFields.offset,
  });

  const response = await appcuesApiRequest.call(this, 'GET', '/jobs', undefined, query);

  if (Array.isArray(response)) {
    return prepareExecutionData(response, { item: index });
  }

  return prepareExecutionData(response as IDataObject, { item: index });
}
