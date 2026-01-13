/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, parseJsonParameter } from '../../transport/GenericFunctions';
import { prepareExecutionData, cleanObject } from '../../utils/helpers';

export async function updateGroup(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const groupId = this.getNodeParameter('groupId', index) as string;
  const propertiesInput = this.getNodeParameter('properties', index, '{}') as string | IDataObject;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const properties = parseJsonParameter(propertiesInput, 'properties', this, index);

  const body: IDataObject = {
    group_id: groupId,
  };

  if (Object.keys(properties).length > 0) {
    body.properties = properties;
  }

  Object.assign(body, cleanObject(additionalFields));

  const response = await appcuesApiRequest.call(
    this,
    'PUT',
    `/groups/${encodeURIComponent(groupId)}`,
    body,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
