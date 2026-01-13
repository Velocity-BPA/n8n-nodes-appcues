/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, parseJsonParameter } from '../../transport/GenericFunctions';
import { prepareExecutionData, cleanObject } from '../../utils/helpers';

export async function createSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const segmentType = this.getNodeParameter('segmentType', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    name,
    type: segmentType,
  };

  if (additionalFields.description) {
    body.description = additionalFields.description;
  }

  if (additionalFields.conditions) {
    body.conditions = parseJsonParameter(
      additionalFields.conditions as string | IDataObject,
      'conditions',
      this,
      index,
    );
  }

  Object.assign(body, cleanObject(additionalFields));

  const response = await appcuesApiRequest.call(this, 'POST', '/segments', body);

  return prepareExecutionData(response as IDataObject, { item: index });
}
