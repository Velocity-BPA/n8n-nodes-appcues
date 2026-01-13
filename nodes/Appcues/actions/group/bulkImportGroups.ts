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

export async function bulkImportGroups(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const inputType = this.getNodeParameter('inputType', index) as string;

  let groups: IDataObject[] = [];

  if (inputType === 'json') {
    const groupsJson = this.getNodeParameter('groupsJson', index) as string;
    const parsed = parseJsonParameter(groupsJson, 'groupsJson', this, index);

    if (Array.isArray(parsed)) {
      groups = parsed;
    } else if (parsed.groups && Array.isArray(parsed.groups)) {
      groups = parsed.groups as IDataObject[];
    } else {
      throw new NodeOperationError(
        this.getNode(),
        'The groups JSON must be an array or an object with a "groups" array.',
        { itemIndex: index },
      );
    }
  } else {
    // Use items from workflow
    const items = this.getInputData();
    groups = items.map((item) => {
      const group: IDataObject = {
        group_id: item.json.group_id || item.json.groupId,
      };

      if (item.json.properties) {
        group.properties = item.json.properties;
      }

      return group;
    });
  }

  if (groups.length === 0) {
    throw new NodeOperationError(this.getNode(), 'No groups provided for import.', {
      itemIndex: index,
    });
  }

  // Validate each group has group_id
  for (let i = 0; i < groups.length; i++) {
    if (!groups[i].group_id) {
      throw new NodeOperationError(
        this.getNode(),
        `Group at index ${i} is missing required field "group_id".`,
        { itemIndex: index },
      );
    }
  }

  const response = await appcuesBulkImportRequest.call(this, '/import/groups', groups);

  return prepareExecutionData(
    {
      success: true,
      groups_count: groups.length,
      ...response,
    } as IDataObject,
    { item: index },
  );
}
