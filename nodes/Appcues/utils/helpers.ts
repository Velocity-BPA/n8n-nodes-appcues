/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Prepare execution data from API response
 */
export function prepareExecutionData(
  data: IDataObject | IDataObject[],
  pairedItem: { item: number },
): INodeExecutionData[] {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      json: item,
      pairedItem,
    }));
  }

  return [
    {
      json: data,
      pairedItem,
    },
  ];
}

/**
 * Prepare bulk data for import
 */
export function prepareBulkData(
  items: INodeExecutionData[],
  dataField: string,
): IDataObject[] {
  return items.map((item) => {
    const data = item.json[dataField];
    if (typeof data === 'object' && data !== null) {
      return data as IDataObject;
    }
    return item.json;
  });
}

/**
 * Format date range for API queries
 */
export function formatDateRange(
  dateFrom?: string | Date,
  dateTo?: string | Date,
): { from?: string; to?: string } {
  const result: { from?: string; to?: string } = {};

  if (dateFrom) {
    result.from =
      dateFrom instanceof Date ? dateFrom.toISOString() : new Date(dateFrom).toISOString();
  }

  if (dateTo) {
    result.to = dateTo instanceof Date ? dateTo.toISOString() : new Date(dateTo).toISOString();
  }

  return result;
}

/**
 * Parse user IDs from various input formats
 */
export function parseUserIds(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.map((id) => id.trim()).filter((id) => id.length > 0);
  }

  // Handle comma-separated string
  return input
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

/**
 * Clean empty values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value as IDataObject);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}

/**
 * Merge properties with existing data
 */
export function mergeProperties(
  existing: IDataObject | undefined,
  updates: IDataObject,
): IDataObject {
  if (!existing) {
    return updates;
  }

  return {
    ...existing,
    ...updates,
  };
}

/**
 * Build profile object for user/group updates
 */
export function buildProfileObject(
  userId: string,
  properties: IDataObject,
  additionalFields?: IDataObject,
): IDataObject {
  const profile: IDataObject = {
    user_id: userId,
  };

  if (Object.keys(properties).length > 0) {
    profile.properties = properties;
  }

  if (additionalFields) {
    Object.assign(profile, cleanObject(additionalFields));
  }

  return profile;
}

/**
 * Build event object for tracking
 */
export function buildEventObject(
  eventName: string,
  userId: string,
  attributes?: IDataObject,
  timestamp?: string,
): IDataObject {
  const event: IDataObject = {
    name: eventName,
    user_id: userId,
  };

  if (attributes && Object.keys(attributes).length > 0) {
    event.attributes = attributes;
  }

  if (timestamp) {
    event.timestamp = timestamp;
  }

  return event;
}

/**
 * Build segment conditions from input
 */
export function buildSegmentConditions(
  conditions: Array<{
    property: string;
    operator: string;
    value: unknown;
  }>,
): IDataObject[] {
  return conditions.map((condition) => ({
    property: condition.property,
    operator: condition.operator,
    value: condition.value as IDataObject | string | number | boolean | null,
  })) as IDataObject[];
}

/**
 * Validate segment type
 */
export function isValidSegmentType(type: string): type is 'static' | 'dynamic' {
  return type === 'static' || type === 'dynamic';
}

/**
 * Validate flow state
 */
export function isValidFlowState(state: string): state is 'published' | 'draft' | 'disabled' {
  return state === 'published' || state === 'draft' || state === 'disabled';
}

/**
 * Validate job status
 */
export function isValidJobStatus(
  status: string,
): status is 'pending' | 'processing' | 'completed' | 'failed' {
  return ['pending', 'processing', 'completed', 'failed'].includes(status);
}

/**
 * Format NPS score for display
 */
export function formatNpsCategory(score: number): string {
  if (score >= 9) {
    return 'Promoter';
  }
  if (score >= 7) {
    return 'Passive';
  }
  return 'Detractor';
}

/**
 * Calculate NPS from responses
 */
export function calculateNps(responses: Array<{ score: number }>): number {
  if (responses.length === 0) {
    return 0;
  }

  const promoters = responses.filter((r) => r.score >= 9).length;
  const detractors = responses.filter((r) => r.score <= 6).length;

  return Math.round(((promoters - detractors) / responses.length) * 100);
}
