/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { appcuesBulkImportRequest, parseJsonParameter } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function bulkImportEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const inputType = this.getNodeParameter('inputType', index) as string;

  let events: IDataObject[] = [];

  if (inputType === 'json') {
    const eventsJson = this.getNodeParameter('eventsJson', index) as string;
    const parsed = parseJsonParameter(eventsJson, 'eventsJson', this, index);

    if (Array.isArray(parsed)) {
      events = parsed;
    } else if (parsed.events && Array.isArray(parsed.events)) {
      events = parsed.events as IDataObject[];
    } else {
      throw new NodeOperationError(
        this.getNode(),
        'The events JSON must be an array or an object with an "events" array.',
        { itemIndex: index },
      );
    }
  } else {
    // Use items from workflow
    const items = this.getInputData();
    events = items.map((item) => {
      const event: IDataObject = {
        user_id: item.json.user_id || item.json.userId,
        name: item.json.name || item.json.eventName,
      };

      if (item.json.attributes) {
        event.attributes = item.json.attributes;
      }

      if (item.json.timestamp) {
        event.timestamp = item.json.timestamp;
      }

      return event;
    });
  }

  if (events.length === 0) {
    throw new NodeOperationError(this.getNode(), 'No events provided for import.', {
      itemIndex: index,
    });
  }

  // Validate each event has required fields
  for (let i = 0; i < events.length; i++) {
    if (!events[i].user_id) {
      throw new NodeOperationError(
        this.getNode(),
        `Event at index ${i} is missing required field "user_id".`,
        { itemIndex: index },
      );
    }
    if (!events[i].name) {
      throw new NodeOperationError(
        this.getNode(),
        `Event at index ${i} is missing required field "name".`,
        { itemIndex: index },
      );
    }
  }

  const response = await appcuesBulkImportRequest.call(this, '/import/events', events);

  return prepareExecutionData(
    {
      success: true,
      events_count: events.length,
      ...response,
    } as IDataObject,
    { item: index },
  );
}
