/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { parseJsonParameter } from '../../transport/GenericFunctions';
import { prepareExecutionData, buildProfileObject } from '../../utils/helpers';

export async function updateUser(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const userId = this.getNodeParameter('userId', index) as string;
  const propertiesInput = this.getNodeParameter('properties', index, '{}') as string | IDataObject;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const properties = parseJsonParameter(propertiesInput, 'properties', this, index);
  const profile = buildProfileObject(userId, properties, additionalFields);

  const response = await appcuesApiRequest.call(
    this,
    'PUT',
    `/users/${encodeURIComponent(userId)}`,
    profile,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
