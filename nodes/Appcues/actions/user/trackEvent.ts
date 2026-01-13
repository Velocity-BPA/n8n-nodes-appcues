/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesHttpApiRequest, parseJsonParameter, toIsoTimestamp } from '../../transport/GenericFunctions';
import { prepareExecutionData, buildEventObject } from '../../utils/helpers';

export async function trackEvent(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const userId = this.getNodeParameter('userId', index) as string;
  const eventName = this.getNodeParameter('eventName', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const attributes = additionalFields.attributes
    ? parseJsonParameter(additionalFields.attributes as string | IDataObject, 'attributes', this, index)
    : {};

  const timestamp = additionalFields.timestamp
    ? toIsoTimestamp(additionalFields.timestamp as string)
    : undefined;

  const event = buildEventObject(eventName, userId, attributes, timestamp);

  // Use HTTP API for real-time event tracking
  const response = await appcuesHttpApiRequest.call(this, userId, {
    events: [event],
  });

  return prepareExecutionData(
    {
      success: true,
      user_id: userId,
      event_name: eventName,
      ...response,
    } as IDataObject,
    { item: index },
  );
}
