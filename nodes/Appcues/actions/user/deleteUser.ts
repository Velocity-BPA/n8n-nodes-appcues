/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function deleteUser(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const userId = this.getNodeParameter('userId', index) as string;

  await appcuesApiRequest.call(this, 'DELETE', `/users/${encodeURIComponent(userId)}`);

  return prepareExecutionData(
    {
      success: true,
      user_id: userId,
      message: 'User deleted successfully',
    } as IDataObject,
    { item: index },
  );
}
