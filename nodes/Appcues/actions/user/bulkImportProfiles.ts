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

export async function bulkImportProfiles(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const inputType = this.getNodeParameter('inputType', index) as string;

  let profiles: IDataObject[] = [];

  if (inputType === 'json') {
    const profilesJson = this.getNodeParameter('profilesJson', index) as string;
    const parsed = parseJsonParameter(profilesJson, 'profilesJson', this, index);

    if (Array.isArray(parsed)) {
      profiles = parsed;
    } else if (parsed.profiles && Array.isArray(parsed.profiles)) {
      profiles = parsed.profiles as IDataObject[];
    } else {
      throw new NodeOperationError(
        this.getNode(),
        'The profiles JSON must be an array or an object with a "profiles" array.',
        { itemIndex: index },
      );
    }
  } else {
    // Use items from workflow
    const items = this.getInputData();
    profiles = items.map((item) => {
      const profile: IDataObject = {
        user_id: item.json.user_id || item.json.userId,
      };

      if (item.json.properties) {
        profile.properties = item.json.properties;
      }

      return profile;
    });
  }

  if (profiles.length === 0) {
    throw new NodeOperationError(this.getNode(), 'No profiles provided for import.', {
      itemIndex: index,
    });
  }

  // Validate each profile has user_id
  for (let i = 0; i < profiles.length; i++) {
    if (!profiles[i].user_id) {
      throw new NodeOperationError(
        this.getNode(),
        `Profile at index ${i} is missing required field "user_id".`,
        { itemIndex: index },
      );
    }
  }

  const response = await appcuesBulkImportRequest.call(this, '/import/profiles', profiles);

  return prepareExecutionData(
    {
      success: true,
      profiles_count: profiles.length,
      ...response,
    } as IDataObject,
    { item: index },
  );
}
