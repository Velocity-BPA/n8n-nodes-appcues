/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getChecklist(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const checklistId = this.getNodeParameter('checklistId', index) as string;

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/checklists/${encodeURIComponent(checklistId)}`,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
