/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getJobStatus(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const jobId = this.getNodeParameter('jobId', index) as string;

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/jobs/${encodeURIComponent(jobId)}`,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
