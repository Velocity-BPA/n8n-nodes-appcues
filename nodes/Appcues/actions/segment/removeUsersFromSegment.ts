/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData, parseUserIds } from '../../utils/helpers';

export async function removeUsersFromSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const userIdsInput = this.getNodeParameter('userIds', index) as string;

  const userIds = parseUserIds(userIdsInput);

  if (userIds.length === 0) {
    throw new NodeOperationError(this.getNode(), 'At least one user ID is required.', {
      itemIndex: index,
    });
  }

  const body: IDataObject = {
    user_ids: userIds,
  };

  const response = await appcuesApiRequest.call(
    this,
    'DELETE',
    `/segments/${encodeURIComponent(segmentId)}/users`,
    body,
  );

  return prepareExecutionData(
    {
      success: true,
      segment_id: segmentId,
      users_removed: userIds.length,
      user_ids: userIds,
      ...response,
    } as IDataObject,
    { item: index },
  );
}
