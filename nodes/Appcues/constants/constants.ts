/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const APPCUES_API_BASE_URL = 'https://api.appcues.com/v2';
export const APPCUES_HTTP_API_BASE_URL = 'https://api.appcues.com/v1';

export const APPCUES_RESOURCES = {
  USER: 'user',
  GROUP: 'group',
  FLOW: 'flow',
  SEGMENT: 'segment',
  CHECKLIST: 'checklist',
  NPS: 'nps',
  JOB: 'job',
} as const;

export const APPCUES_USER_OPERATIONS = {
  GET_USER: 'getUser',
  UPDATE_USER: 'updateUser',
  TRACK_EVENT: 'trackEvent',
  GET_RECENT_EVENTS: 'getRecentEvents',
  BULK_IMPORT_PROFILES: 'bulkImportProfiles',
  BULK_IMPORT_EVENTS: 'bulkImportEvents',
  DELETE_USER: 'deleteUser',
} as const;

export const APPCUES_GROUP_OPERATIONS = {
  GET_GROUP: 'getGroup',
  UPDATE_GROUP: 'updateGroup',
  BULK_IMPORT_GROUPS: 'bulkImportGroups',
} as const;

export const APPCUES_FLOW_OPERATIONS = {
  LIST_FLOWS: 'listFlows',
  GET_FLOW: 'getFlow',
  PUBLISH_FLOW: 'publishFlow',
  UNPUBLISH_FLOW: 'unpublishFlow',
  GET_FLOW_ANALYTICS: 'getFlowAnalytics',
} as const;

export const APPCUES_SEGMENT_OPERATIONS = {
  LIST_SEGMENTS: 'listSegments',
  GET_SEGMENT: 'getSegment',
  CREATE_SEGMENT: 'createSegment',
  UPDATE_SEGMENT: 'updateSegment',
  DELETE_SEGMENT: 'deleteSegment',
  ADD_USERS_TO_SEGMENT: 'addUsersToSegment',
  REMOVE_USERS_FROM_SEGMENT: 'removeUsersFromSegment',
} as const;

export const APPCUES_CHECKLIST_OPERATIONS = {
  LIST_CHECKLISTS: 'listChecklists',
  GET_CHECKLIST: 'getChecklist',
} as const;

export const APPCUES_NPS_OPERATIONS = {
  LIST_NPS_SURVEYS: 'listNpsSurveys',
  GET_NPS_SURVEY: 'getNpsSurvey',
  GET_NPS_RESPONSES: 'getNpsResponses',
} as const;

export const APPCUES_JOB_OPERATIONS = {
  GET_JOB_STATUS: 'getJobStatus',
  LIST_JOBS: 'listJobs',
} as const;

export const APPCUES_TRIGGER_EVENTS = [
  'flow_started',
  'flow_completed',
  'flow_skipped',
  'step_started',
  'step_completed',
  'step_skipped',
  'step_interacted',
  'form_submitted',
  'form_field_submitted',
  'checklist_shown',
  'checklist_completed',
  'checklist_item_completed',
  'nps_shown',
  'nps_score_submitted',
  'nps_feedback_submitted',
] as const;

export const APPCUES_FLOW_STATES = ['published', 'draft', 'disabled'] as const;

export const APPCUES_SEGMENT_TYPES = ['static', 'dynamic'] as const;

export const APPCUES_JOB_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;

export const APPCUES_SEGMENT_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'exists',
  'not_exists',
] as const;

export const APPCUES_LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;
