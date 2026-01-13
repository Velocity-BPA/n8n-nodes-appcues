/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/segments/${encodeURIComponent(segmentId)}`,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
