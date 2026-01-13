/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IAppcuesCredentials {
  accountId: string;
  apiKey: string;
  apiSecret: string;
}

export interface IAppcuesUserProfile {
  user_id: string;
  properties?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface IAppcuesEvent {
  name: string;
  user_id: string;
  timestamp?: string;
  attributes?: Record<string, unknown>;
}

export interface IAppcuesGroup {
  group_id: string;
  properties?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface IAppcuesFlow {
  id: string;
  name: string;
  state: 'published' | 'draft' | 'disabled';
  created_at: string;
  updated_at: string;
  published_at?: string;
  frequency?: string;
  steps?: IAppcuesFlowStep[];
}

export interface IAppcuesFlowStep {
  id: string;
  type: string;
  content?: Record<string, unknown>;
}

export interface IAppcuesFlowAnalytics {
  flow_id: string;
  total_starts: number;
  total_completions: number;
  total_skips: number;
  completion_rate: number;
  step_analytics?: IAppcuesStepAnalytics[];
}

export interface IAppcuesStepAnalytics {
  step_id: string;
  views: number;
  completions: number;
  skips: number;
}

export interface IAppcuesSegment {
  id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  created_at: string;
  updated_at: string;
  user_count?: number;
  conditions?: IAppcuesSegmentCondition[];
}

export interface IAppcuesSegmentCondition {
  property: string;
  operator: string;
  value: unknown;
}

export interface IAppcuesChecklist {
  id: string;
  name: string;
  state: 'published' | 'draft' | 'disabled';
  created_at: string;
  updated_at: string;
  items?: IAppcuesChecklistItem[];
}

export interface IAppcuesChecklistItem {
  id: string;
  title: string;
  completed?: boolean;
}

export interface IAppcuesNpsSurvey {
  id: string;
  name: string;
  state: 'published' | 'draft' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface IAppcuesNpsResponse {
  id: string;
  survey_id: string;
  user_id: string;
  score: number;
  feedback?: string;
  created_at: string;
}

export interface IAppcuesJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: string;
  created_at: string;
  completed_at?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface IAppcuesBulkImportResult {
  job_id: string;
  job_url: string;
  status: string;
}

export interface IAppcuesApiError {
  error: boolean;
  message: {
    description: string;
    title: string;
    type: string;
  };
  status_code: number;
}

export interface IAppcuesPaginatedResponse<T> {
  data: T[];
  pagination?: {
    has_more: boolean;
    cursor?: string;
  };
}

export type AppcuesResource =
  | 'user'
  | 'group'
  | 'flow'
  | 'segment'
  | 'checklist'
  | 'nps'
  | 'job';

export type AppcuesUserOperation =
  | 'getUser'
  | 'updateUser'
  | 'trackEvent'
  | 'getRecentEvents'
  | 'bulkImportProfiles'
  | 'bulkImportEvents'
  | 'deleteUser';

export type AppcuesGroupOperation =
  | 'getGroup'
  | 'updateGroup'
  | 'bulkImportGroups';

export type AppcuesFlowOperation =
  | 'listFlows'
  | 'getFlow'
  | 'publishFlow'
  | 'unpublishFlow'
  | 'getFlowAnalytics';

export type AppcuesSegmentOperation =
  | 'listSegments'
  | 'getSegment'
  | 'createSegment'
  | 'updateSegment'
  | 'deleteSegment'
  | 'addUsersToSegment'
  | 'removeUsersFromSegment';

export type AppcuesChecklistOperation =
  | 'listChecklists'
  | 'getChecklist';

export type AppcuesNpsOperation =
  | 'listNpsSurveys'
  | 'getNpsSurvey'
  | 'getNpsResponses';

export type AppcuesJobOperation =
  | 'getJobStatus'
  | 'listJobs';

export interface IAppcuesTriggerEvent {
  event_type: string;
  user_id: string;
  flow_id?: string;
  step_id?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}
