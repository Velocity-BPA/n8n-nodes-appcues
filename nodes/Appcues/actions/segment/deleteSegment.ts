/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function deleteSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  await appcuesApiRequest.call(this, 'DELETE', `/segments/${encodeURIComponent(segmentId)}`);

  return prepareExecutionData(
    {
      success: true,
      segment_id: segmentId,
      message: 'Segment deleted successfully',
    } as IDataObject,
    { item: index },
  );
}
