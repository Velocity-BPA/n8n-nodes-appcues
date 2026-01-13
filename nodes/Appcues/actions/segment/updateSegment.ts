/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, parseJsonParameter } from '../../transport/GenericFunctions';
import { prepareExecutionData, cleanObject } from '../../utils/helpers';

export async function updateSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.description !== undefined) {
    body.description = updateFields.description;
  }

  if (updateFields.conditions) {
    body.conditions = parseJsonParameter(
      updateFields.conditions as string | IDataObject,
      'conditions',
      this,
      index,
    );
  }

  Object.assign(body, cleanObject(updateFields));

  const response = await appcuesApiRequest.call(
    this,
    'PUT',
    `/segments/${encodeURIComponent(segmentId)}`,
    body,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
