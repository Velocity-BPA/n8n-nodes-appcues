/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as user from './actions/user';
import * as group from './actions/group';
import * as flow from './actions/flow';
import * as segment from './actions/segment';
import * as checklist from './actions/checklist';
import * as nps from './actions/nps';
import * as job from './actions/job';
import * as event from './actions/event';
import * as pin from './actions/pin';
import * as banner from './actions/banner';
import * as analytics from './actions/analytics';
import * as account from './actions/account';

import { logLicensingNotice } from './transport/GenericFunctions';

export class Appcues implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Appcues',
    name: 'appcues',
    icon: 'file:appcues.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Appcues API for user management, event tracking, flows, segments, and more',
    defaults: {
      name: 'Appcues',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'appcuesApi',
        required: true,
      },
    ],
    properties: [
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account' },
          { name: 'Analytics', value: 'analytics' },
          { name: 'Banner', value: 'banner' },
          { name: 'Checklist', value: 'checklist' },
          { name: 'Event', value: 'event' },
          { name: 'Flow', value: 'flow' },
          { name: 'Group', value: 'group' },
          { name: 'Job', value: 'job' },
          { name: 'NPS', value: 'nps' },
          { name: 'Pin', value: 'pin' },
          { name: 'Segment', value: 'segment' },
          { name: 'User', value: 'user' },
        ],
        default: 'user',
      },

      // ==================== USER OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['user'] } },
        options: [
          { name: 'Bulk Import Events', value: 'bulkImportEvents', action: 'Bulk import events', description: 'Import multiple events at once' },
          { name: 'Bulk Import Profiles', value: 'bulkImportProfiles', action: 'Bulk import profiles', description: 'Import multiple user profiles at once' },
          { name: 'Delete User', value: 'deleteUser', action: 'Delete user', description: 'Delete a user and their data' },
          { name: 'Get Recent Events', value: 'getRecentEvents', action: 'Get recent events', description: 'Get recent events for a user' },
          { name: 'Get User', value: 'getUser', action: 'Get user', description: 'Get a user profile by ID' },
          { name: 'Get User Flow History', value: 'getUserFlowHistory', action: 'Get user flow history', description: 'Get flow interactions for a user' },
          { name: 'List Users', value: 'listUsers', action: 'List users', description: 'List all users' },
          { name: 'Search Users', value: 'searchUsers', action: 'Search users', description: 'Search users by property' },
          { name: 'Track Event', value: 'trackEvent', action: 'Track event', description: 'Track a user event' },
          { name: 'Update User', value: 'updateUser', action: 'Update user', description: 'Update user properties' },
        ],
        default: 'getUser',
      },

      // User: userId field
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getUser', 'updateUser', 'trackEvent', 'getRecentEvents', 'deleteUser', 'getUserFlowHistory'],
          },
        },
        default: '',
        description: 'The unique identifier for the user',
      },

      // User: eventName field
      {
        displayName: 'Event Name',
        name: 'eventName',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['user'], operation: ['trackEvent'] } },
        default: '',
        description: 'Name of the event to track',
      },

      // User: properties for updateUser
      {
        displayName: 'Properties',
        name: 'properties',
        type: 'json',
        displayOptions: { show: { resource: ['user'], operation: ['updateUser'] } },
        default: '{}',
        description: 'User properties as JSON object (no nested objects)',
      },

      // User: eventAttributes for trackEvent
      {
        displayName: 'Event Attributes',
        name: 'eventAttributes',
        type: 'json',
        displayOptions: { show: { resource: ['user'], operation: ['trackEvent'] } },
        default: '{}',
        description: 'Event attributes as JSON object',
      },

      // User: bulkData for bulk imports
      {
        displayName: 'Bulk Data',
        name: 'bulkData',
        type: 'json',
        required: true,
        displayOptions: { show: { resource: ['user'], operation: ['bulkImportProfiles', 'bulkImportEvents'] } },
        default: '[]',
        description: 'Array of records to import as JSON',
      },

      // User: searchQuery
      {
        displayName: 'Search Query',
        name: 'searchQuery',
        type: 'json',
        required: true,
        displayOptions: { show: { resource: ['user'], operation: ['searchUsers'] } },
        default: '{}',
        description: 'Search query as JSON object',
      },

      // User: returnAll / limit for list operations
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['user'], operation: ['listUsers', 'searchUsers', 'getRecentEvents', 'getUserFlowHistory'] } },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['user'], operation: ['listUsers', 'searchUsers', 'getRecentEvents', 'getUserFlowHistory'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // User: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['user'], operation: ['trackEvent', 'getRecentEvents', 'listUsers', 'getUserFlowHistory'] } },
        options: [
          { displayName: 'Timestamp', name: 'timestamp', type: 'number', default: 0, description: 'Unix timestamp for the event' },
          { displayName: 'Event Type', name: 'eventType', type: 'string', default: '', description: 'Filter by event type' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
          { displayName: 'Segment ID', name: 'segmentId', type: 'string', default: '', description: 'Filter by segment' },
          { displayName: 'Flow ID', name: 'flowId', type: 'string', default: '', description: 'Filter by flow' },
        ],
      },

      // ==================== GROUP OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['group'] } },
        options: [
          { name: 'Add User to Group', value: 'addUserToGroup', action: 'Add user to group', description: 'Add a user to a group' },
          { name: 'Bulk Import Groups', value: 'bulkImportGroups', action: 'Bulk import groups', description: 'Import multiple groups at once' },
          { name: 'Delete Group', value: 'deleteGroup', action: 'Delete group', description: 'Delete a group' },
          { name: 'Get Group', value: 'getGroup', action: 'Get group', description: 'Get a group by ID' },
          { name: 'Get Group Users', value: 'getGroupUsers', action: 'Get group users', description: 'Get users in a group' },
          { name: 'List Groups', value: 'listGroups', action: 'List groups', description: 'List all groups' },
          { name: 'Remove User from Group', value: 'removeUserFromGroup', action: 'Remove user from group', description: 'Remove a user from a group' },
          { name: 'Search Groups', value: 'searchGroups', action: 'Search groups', description: 'Search groups by property' },
          { name: 'Update Group', value: 'updateGroup', action: 'Update group', description: 'Update group properties' },
        ],
        default: 'getGroup',
      },

      // Group: groupId field
      {
        displayName: 'Group ID',
        name: 'groupId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['group'], operation: ['getGroup', 'updateGroup', 'deleteGroup', 'getGroupUsers', 'addUserToGroup', 'removeUserFromGroup'] } },
        default: '',
        description: 'The unique identifier for the group',
      },

      // Group: userId for membership operations
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['group'], operation: ['addUserToGroup', 'removeUserFromGroup'] } },
        default: '',
        description: 'The user ID to add/remove',
      },

      // Group: properties
      {
        displayName: 'Properties',
        name: 'properties',
        type: 'json',
        displayOptions: { show: { resource: ['group'], operation: ['updateGroup'] } },
        default: '{}',
        description: 'Group properties as JSON object',
      },

      // Group: bulkData
      {
        displayName: 'Bulk Data',
        name: 'bulkData',
        type: 'json',
        required: true,
        displayOptions: { show: { resource: ['group'], operation: ['bulkImportGroups'] } },
        default: '[]',
        description: 'Array of group records to import',
      },

      // Group: searchQuery
      {
        displayName: 'Search Query',
        name: 'searchQuery',
        type: 'json',
        required: true,
        displayOptions: { show: { resource: ['group'], operation: ['searchGroups'] } },
        default: '{}',
        description: 'Search query as JSON object',
      },

      // Group: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['group'], operation: ['listGroups', 'searchGroups', 'getGroupUsers'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['group'], operation: ['listGroups', 'searchGroups', 'getGroupUsers'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // ==================== FLOW OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['flow'] } },
        options: [
          { name: 'Archive Flow', value: 'archiveFlow', action: 'Archive flow', description: 'Archive a flow' },
          { name: 'Duplicate Flow', value: 'duplicateFlow', action: 'Duplicate flow', description: 'Clone a flow' },
          { name: 'Get Flow', value: 'getFlow', action: 'Get flow', description: 'Get flow details' },
          { name: 'Get Flow Analytics', value: 'getFlowAnalytics', action: 'Get flow analytics', description: 'Get flow performance metrics' },
          { name: 'Get Flow Steps', value: 'getFlowSteps', action: 'Get flow steps', description: 'Get steps in a flow' },
          { name: 'List Flows', value: 'listFlows', action: 'List flows', description: 'List all flows' },
          { name: 'Preview Flow', value: 'previewFlow', action: 'Preview flow', description: 'Generate preview URL' },
          { name: 'Publish Flow', value: 'publishFlow', action: 'Publish flow', description: 'Publish flow to production' },
          { name: 'Restore Flow', value: 'restoreFlow', action: 'Restore flow', description: 'Restore archived flow' },
          { name: 'Unpublish Flow', value: 'unpublishFlow', action: 'Unpublish flow', description: 'Remove flow from production' },
          { name: 'Update Flow', value: 'updateFlow', action: 'Update flow', description: 'Update flow settings' },
        ],
        default: 'listFlows',
      },

      // Flow: flowId
      {
        displayName: 'Flow ID',
        name: 'flowId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['flow'], operation: ['getFlow', 'publishFlow', 'unpublishFlow', 'getFlowAnalytics', 'updateFlow', 'duplicateFlow', 'getFlowSteps', 'archiveFlow', 'restoreFlow', 'previewFlow'] } },
        default: '',
        description: 'The unique identifier for the flow',
      },

      // Flow: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['flow'], operation: ['listFlows'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['flow'], operation: ['listFlows'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Flow: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['flow'], operation: ['updateFlow'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Flow name' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Frequency', name: 'frequency', type: 'string', default: '', description: 'Display frequency' },
          { displayName: 'Priority', name: 'priority', type: 'number', default: 0, description: 'Flow priority' },
        ],
      },

      // Flow: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['flow'], operation: ['listFlows', 'getFlowAnalytics', 'duplicateFlow', 'previewFlow'] } },
        options: [
          { displayName: 'State', name: 'state', type: 'options', options: [{ name: 'All', value: '' }, { name: 'Published', value: 'published' }, { name: 'Draft', value: 'draft' }, { name: 'Archived', value: 'archived' }], default: '', description: 'Filter by flow state' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Name for duplicated flow' },
          { displayName: 'User ID', name: 'userId', type: 'string', default: '', description: 'User ID for preview' },
        ],
      },

      // ==================== SEGMENT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['segment'] } },
        options: [
          { name: 'Add Users to Segment', value: 'addUsersToSegment', action: 'Add users to segment', description: 'Add users to a static segment' },
          { name: 'Clone Segment', value: 'cloneSegment', action: 'Clone segment', description: 'Duplicate a segment' },
          { name: 'Create Segment', value: 'createSegment', action: 'Create segment', description: 'Create a new segment' },
          { name: 'Delete Segment', value: 'deleteSegment', action: 'Delete segment', description: 'Delete a segment' },
          { name: 'Get Segment', value: 'getSegment', action: 'Get segment', description: 'Get segment details' },
          { name: 'Get Segment Size', value: 'getSegmentSize', action: 'Get segment size', description: 'Get member count' },
          { name: 'List Segment Users', value: 'listSegmentUsers', action: 'List segment users', description: 'Get users in a segment' },
          { name: 'List Segments', value: 'listSegments', action: 'List segments', description: 'List all segments' },
          { name: 'Remove Users from Segment', value: 'removeUsersFromSegment', action: 'Remove users from segment', description: 'Remove users from a segment' },
          { name: 'Update Segment', value: 'updateSegment', action: 'Update segment', description: 'Update segment definition' },
        ],
        default: 'listSegments',
      },

      // Segment: segmentId
      {
        displayName: 'Segment ID',
        name: 'segmentId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['segment'], operation: ['getSegment', 'updateSegment', 'deleteSegment', 'addUsersToSegment', 'removeUsersFromSegment', 'getSegmentSize', 'listSegmentUsers', 'cloneSegment'] } },
        default: '',
        description: 'The unique identifier for the segment',
      },

      // Segment: name for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['segment'], operation: ['createSegment'] } },
        default: '',
        description: 'Segment name',
      },

      // Segment: segmentType
      {
        displayName: 'Segment Type',
        name: 'segmentType',
        type: 'options',
        displayOptions: { show: { resource: ['segment'], operation: ['createSegment'] } },
        options: [
          { name: 'Static', value: 'static' },
          { name: 'Dynamic', value: 'dynamic' },
        ],
        default: 'static',
        description: 'Type of segment',
      },

      // Segment: userIds for bulk operations
      {
        displayName: 'User IDs',
        name: 'userIds',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['segment'], operation: ['addUsersToSegment', 'removeUsersFromSegment'] } },
        default: '',
        description: 'Comma-separated list of user IDs',
      },

      // Segment: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['segment'], operation: ['listSegments', 'listSegmentUsers'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['segment'], operation: ['listSegments', 'listSegmentUsers'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Segment: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['segment'], operation: ['updateSegment'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Segment name' },
          { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Segment description' },
          { displayName: 'Definition', name: 'definition', type: 'json', default: '{}', description: 'Segment rules as JSON' },
        ],
      },

      // Segment: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['segment'], operation: ['createSegment', 'listSegments', 'cloneSegment'] } },
        options: [
          { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Segment description' },
          { displayName: 'Definition', name: 'definition', type: 'json', default: '{}', description: 'Segment rules as JSON' },
          { displayName: 'Type Filter', name: 'type', type: 'options', options: [{ name: 'All', value: '' }, { name: 'Static', value: 'static' }, { name: 'Dynamic', value: 'dynamic' }], default: '', description: 'Filter by segment type' },
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Name for cloned segment' },
        ],
      },

      // ==================== CHECKLIST OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['checklist'] } },
        options: [
          { name: 'Create Checklist', value: 'createChecklist', action: 'Create checklist', description: 'Create a new checklist' },
          { name: 'Delete Checklist', value: 'deleteChecklist', action: 'Delete checklist', description: 'Delete a checklist' },
          { name: 'Get Checklist', value: 'getChecklist', action: 'Get checklist', description: 'Get checklist details' },
          { name: 'Get Checklist Analytics', value: 'getChecklistAnalytics', action: 'Get checklist analytics', description: 'Get completion metrics' },
          { name: 'Get Checklist Items', value: 'getChecklistItems', action: 'Get checklist items', description: 'Get items in a checklist' },
          { name: 'Get User Progress', value: 'getUserChecklistProgress', action: 'Get user progress', description: 'Get user checklist progress' },
          { name: 'List Checklists', value: 'listChecklists', action: 'List checklists', description: 'List all checklists' },
          { name: 'Publish Checklist', value: 'publishChecklist', action: 'Publish checklist', description: 'Publish a checklist' },
          { name: 'Unpublish Checklist', value: 'unpublishChecklist', action: 'Unpublish checklist', description: 'Unpublish a checklist' },
          { name: 'Update Checklist', value: 'updateChecklist', action: 'Update checklist', description: 'Update a checklist' },
        ],
        default: 'listChecklists',
      },

      // Checklist: checklistId
      {
        displayName: 'Checklist ID',
        name: 'checklistId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['checklist'], operation: ['getChecklist', 'updateChecklist', 'deleteChecklist', 'publishChecklist', 'unpublishChecklist', 'getChecklistAnalytics', 'getChecklistItems', 'getUserChecklistProgress'] } },
        default: '',
        description: 'The unique identifier for the checklist',
      },

      // Checklist: name for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['checklist'], operation: ['createChecklist'] } },
        default: '',
        description: 'Checklist name',
      },

      // Checklist: userId for progress
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['checklist'], operation: ['getUserChecklistProgress'] } },
        default: '',
        description: 'User ID to get progress for',
      },

      // Checklist: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['checklist'], operation: ['listChecklists'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['checklist'], operation: ['listChecklists'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Checklist: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['checklist'], operation: ['updateChecklist'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Checklist name' },
          { displayName: 'Items', name: 'items', type: 'json', default: '[]', description: 'Checklist items as JSON array' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Appearance', name: 'appearance', type: 'json', default: '{}', description: 'Styling options as JSON' },
        ],
      },

      // Checklist: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['checklist'], operation: ['createChecklist', 'getChecklistAnalytics'] } },
        options: [
          { displayName: 'Items', name: 'items', type: 'json', default: '[]', description: 'Checklist items as JSON array' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Appearance', name: 'appearance', type: 'json', default: '{}', description: 'Styling options as JSON' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
        ],
      },

      // ==================== NPS OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['nps'] } },
        options: [
          { name: 'Create NPS Survey', value: 'createNpsSurvey', action: 'Create NPS survey', description: 'Create a new NPS survey' },
          { name: 'Delete NPS Survey', value: 'deleteNpsSurvey', action: 'Delete NPS survey', description: 'Delete an NPS survey' },
          { name: 'Export NPS Data', value: 'exportNpsData', action: 'Export NPS data', description: 'Export NPS data' },
          { name: 'Get NPS Analytics', value: 'getNpsAnalytics', action: 'Get NPS analytics', description: 'Get NPS score analytics' },
          { name: 'Get NPS Responses', value: 'getNpsResponses', action: 'Get NPS responses', description: 'Get NPS survey responses' },
          { name: 'Get NPS Survey', value: 'getNpsSurvey', action: 'Get NPS survey', description: 'Get NPS survey details' },
          { name: 'List NPS Surveys', value: 'listNpsSurveys', action: 'List NPS surveys', description: 'List all NPS surveys' },
          { name: 'Publish NPS Survey', value: 'publishNpsSurvey', action: 'Publish NPS survey', description: 'Publish an NPS survey' },
          { name: 'Unpublish NPS Survey', value: 'unpublishNpsSurvey', action: 'Unpublish NPS survey', description: 'Unpublish an NPS survey' },
          { name: 'Update NPS Survey', value: 'updateNpsSurvey', action: 'Update NPS survey', description: 'Update NPS settings' },
        ],
        default: 'listNpsSurveys',
      },

      // NPS: surveyId
      {
        displayName: 'Survey ID',
        name: 'surveyId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['nps'], operation: ['getNpsSurvey', 'updateNpsSurvey', 'deleteNpsSurvey', 'publishNpsSurvey', 'unpublishNpsSurvey', 'getNpsResponses', 'getNpsAnalytics', 'exportNpsData'] } },
        default: '',
        description: 'The unique identifier for the NPS survey',
      },

      // NPS: name for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['nps'], operation: ['createNpsSurvey'] } },
        default: '',
        description: 'Survey name',
      },

      // NPS: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['nps'], operation: ['listNpsSurveys', 'getNpsResponses'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['nps'], operation: ['listNpsSurveys', 'getNpsResponses'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // NPS: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['nps'], operation: ['updateNpsSurvey'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Survey name' },
          { displayName: 'Question', name: 'question', type: 'string', default: '', description: 'Custom NPS question' },
          { displayName: 'Follow-up Question', name: 'followUpQuestion', type: 'string', default: '', description: 'Follow-up question' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
        ],
      },

      // NPS: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['nps'], operation: ['createNpsSurvey', 'getNpsResponses', 'getNpsAnalytics', 'exportNpsData'] } },
        options: [
          { displayName: 'Question', name: 'question', type: 'string', default: '', description: 'Custom NPS question' },
          { displayName: 'Follow-up Question', name: 'followUpQuestion', type: 'string', default: '', description: 'Follow-up question' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
          { displayName: 'Granularity', name: 'granularity', type: 'options', options: [{ name: 'Day', value: 'day' }, { name: 'Week', value: 'week' }, { name: 'Month', value: 'month' }], default: 'day', description: 'Time granularity' },
          { displayName: 'Format', name: 'format', type: 'options', options: [{ name: 'JSON', value: 'json' }, { name: 'CSV', value: 'csv' }], default: 'json', description: 'Export format' },
          { displayName: 'Calculate NPS', name: 'calculateNps', type: 'boolean', default: false, description: 'Calculate overall NPS score' },
        ],
      },

      // ==================== JOB OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['job'] } },
        options: [
          { name: 'Cancel Job', value: 'cancelJob', action: 'Cancel job', description: 'Cancel a pending job' },
          { name: 'Get Job Results', value: 'getJobResults', action: 'Get job results', description: 'Get results of a completed job' },
          { name: 'Get Job Status', value: 'getJobStatus', action: 'Get job status', description: 'Get the status of a job' },
          { name: 'List Jobs', value: 'listJobs', action: 'List jobs', description: 'List recent jobs' },
          { name: 'Retry Job', value: 'retryJob', action: 'Retry job', description: 'Retry a failed job' },
        ],
        default: 'listJobs',
      },

      // Job: jobId
      {
        displayName: 'Job ID',
        name: 'jobId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['job'], operation: ['getJobStatus', 'cancelJob', 'getJobResults', 'retryJob'] } },
        default: '',
        description: 'The unique identifier for the job',
      },

      // Job: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['job'], operation: ['listJobs'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['job'], operation: ['listJobs'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Job: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['job'], operation: ['listJobs'] } },
        options: [
          { displayName: 'Job Type', name: 'jobType', type: 'string', default: '', description: 'Filter by job type' },
          { displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'All', value: '' }, { name: 'Pending', value: 'pending' }, { name: 'Processing', value: 'processing' }, { name: 'Completed', value: 'completed' }, { name: 'Failed', value: 'failed' }], default: '', description: 'Filter by status' },
        ],
      },

      // ==================== EVENT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['event'] } },
        options: [
          { name: 'Create Event Definition', value: 'createEventDefinition', action: 'Create event definition', description: 'Define a new event' },
          { name: 'Delete Event Definition', value: 'deleteEventDefinition', action: 'Delete event definition', description: 'Delete an event definition' },
          { name: 'Get Event Analytics', value: 'getEventAnalytics', action: 'Get event analytics', description: 'Get event metrics' },
          { name: 'Get Event Definition', value: 'getEventDefinition', action: 'Get event definition', description: 'Get event details' },
          { name: 'List Event Definitions', value: 'listEventDefinitions', action: 'List event definitions', description: 'List all tracked events' },
          { name: 'Track Server Event', value: 'trackServerEvent', action: 'Track server event', description: 'Track event server-side' },
          { name: 'Update Event Definition', value: 'updateEventDefinition', action: 'Update event definition', description: 'Update an event definition' },
        ],
        default: 'listEventDefinitions',
      },

      // Event: eventId
      {
        displayName: 'Event ID',
        name: 'eventId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['event'], operation: ['getEventDefinition', 'updateEventDefinition', 'deleteEventDefinition', 'getEventAnalytics'] } },
        default: '',
        description: 'The unique identifier for the event',
      },

      // Event: name for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['event'], operation: ['createEventDefinition'] } },
        default: '',
        description: 'Event name',
      },

      // Event: userId and eventName for trackServerEvent
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['event'], operation: ['trackServerEvent'] } },
        default: '',
        description: 'User ID to track event for',
      },
      {
        displayName: 'Event Name',
        name: 'eventName',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['event'], operation: ['trackServerEvent'] } },
        default: '',
        description: 'Name of the event to track',
      },

      // Event: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['event'], operation: ['listEventDefinitions'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['event'], operation: ['listEventDefinitions'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Event: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['event'], operation: ['updateEventDefinition'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Event name' },
          { displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Event category' },
          { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Event description' },
          { displayName: 'Properties', name: 'properties', type: 'json', default: '{}', description: 'Event schema as JSON' },
        ],
      },

      // Event: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['event'], operation: ['createEventDefinition', 'listEventDefinitions', 'getEventAnalytics', 'trackServerEvent'] } },
        options: [
          { displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Event category' },
          { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Event description' },
          { displayName: 'Properties', name: 'properties', type: 'json', default: '{}', description: 'Event schema as JSON' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
          { displayName: 'Granularity', name: 'granularity', type: 'options', options: [{ name: 'Day', value: 'day' }, { name: 'Week', value: 'week' }, { name: 'Month', value: 'month' }], default: 'day', description: 'Time granularity' },
          { displayName: 'Timestamp', name: 'timestamp', type: 'number', default: 0, description: 'Unix timestamp for the event' },
          { displayName: 'Attributes', name: 'attributes', type: 'json', default: '{}', description: 'Event attributes as JSON' },
          { displayName: 'Context', name: 'context', type: 'json', default: '{}', description: 'Event context as JSON' },
        ],
      },

      // ==================== PIN OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['pin'] } },
        options: [
          { name: 'Create Pin', value: 'createPin', action: 'Create pin', description: 'Create a new pin/tooltip' },
          { name: 'Delete Pin', value: 'deletePin', action: 'Delete pin', description: 'Delete a pin' },
          { name: 'Get Pin', value: 'getPin', action: 'Get pin', description: 'Get pin details' },
          { name: 'Get Pin Analytics', value: 'getPinAnalytics', action: 'Get pin analytics', description: 'Get pin metrics' },
          { name: 'List Pins', value: 'listPins', action: 'List pins', description: 'List all pins' },
          { name: 'Publish Pin', value: 'publishPin', action: 'Publish pin', description: 'Publish a pin' },
          { name: 'Unpublish Pin', value: 'unpublishPin', action: 'Unpublish pin', description: 'Unpublish a pin' },
          { name: 'Update Pin', value: 'updatePin', action: 'Update pin', description: 'Update a pin' },
        ],
        default: 'listPins',
      },

      // Pin: pinId
      {
        displayName: 'Pin ID',
        name: 'pinId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['pin'], operation: ['getPin', 'updatePin', 'deletePin', 'publishPin', 'unpublishPin', 'getPinAnalytics'] } },
        default: '',
        description: 'The unique identifier for the pin',
      },

      // Pin: name and selector for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['pin'], operation: ['createPin'] } },
        default: '',
        description: 'Pin name',
      },
      {
        displayName: 'Selector',
        name: 'selector',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['pin'], operation: ['createPin'] } },
        default: '',
        description: 'CSS selector for target element',
      },

      // Pin: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['pin'], operation: ['listPins'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['pin'], operation: ['listPins'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Pin: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['pin'], operation: ['updatePin'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Pin name' },
          { displayName: 'Selector', name: 'selector', type: 'string', default: '', description: 'CSS selector' },
          { displayName: 'Content', name: 'content', type: 'json', default: '{}', description: 'Pin content as JSON' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Position', name: 'position', type: 'string', default: '', description: 'Pin position' },
          { displayName: 'Page URL', name: 'pageUrl', type: 'string', default: '', description: 'Target page URL' },
        ],
      },

      // Pin: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['pin'], operation: ['createPin', 'listPins', 'getPinAnalytics'] } },
        options: [
          { displayName: 'Content', name: 'content', type: 'json', default: '{}', description: 'Pin content as JSON' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Position', name: 'position', type: 'string', default: '', description: 'Pin position' },
          { displayName: 'Page URL', name: 'pageUrl', type: 'string', default: '', description: 'Target page URL' },
          { displayName: 'State', name: 'state', type: 'options', options: [{ name: 'All', value: '' }, { name: 'Published', value: 'published' }, { name: 'Draft', value: 'draft' }], default: '', description: 'Filter by state' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
        ],
      },

      // ==================== BANNER OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['banner'] } },
        options: [
          { name: 'Create Banner', value: 'createBanner', action: 'Create banner', description: 'Create a new banner' },
          { name: 'Delete Banner', value: 'deleteBanner', action: 'Delete banner', description: 'Delete a banner' },
          { name: 'Get Banner', value: 'getBanner', action: 'Get banner', description: 'Get banner details' },
          { name: 'Get Banner Analytics', value: 'getBannerAnalytics', action: 'Get banner analytics', description: 'Get banner metrics' },
          { name: 'List Banners', value: 'listBanners', action: 'List banners', description: 'List all banners' },
          { name: 'Publish Banner', value: 'publishBanner', action: 'Publish banner', description: 'Publish a banner' },
          { name: 'Unpublish Banner', value: 'unpublishBanner', action: 'Unpublish banner', description: 'Unpublish a banner' },
          { name: 'Update Banner', value: 'updateBanner', action: 'Update banner', description: 'Update a banner' },
        ],
        default: 'listBanners',
      },

      // Banner: bannerId
      {
        displayName: 'Banner ID',
        name: 'bannerId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['banner'], operation: ['getBanner', 'updateBanner', 'deleteBanner', 'publishBanner', 'unpublishBanner', 'getBannerAnalytics'] } },
        default: '',
        description: 'The unique identifier for the banner',
      },

      // Banner: name for create
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['banner'], operation: ['createBanner'] } },
        default: '',
        description: 'Banner name',
      },

      // Banner: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['banner'], operation: ['listBanners'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['banner'], operation: ['listBanners'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Banner: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['banner'], operation: ['updateBanner'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Banner name' },
          { displayName: 'Content', name: 'content', type: 'json', default: '{}', description: 'Banner content as JSON' },
          { displayName: 'Position', name: 'position', type: 'options', options: [{ name: 'Top', value: 'top' }, { name: 'Bottom', value: 'bottom' }], default: 'top', description: 'Banner position' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Background Color', name: 'backgroundColor', type: 'string', default: '', description: 'Background color (hex)' },
          { displayName: 'Text Color', name: 'textColor', type: 'string', default: '', description: 'Text color (hex)' },
        ],
      },

      // Banner: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['banner'], operation: ['createBanner', 'listBanners', 'getBannerAnalytics'] } },
        options: [
          { displayName: 'Content', name: 'content', type: 'json', default: '{}', description: 'Banner content as JSON' },
          { displayName: 'Position', name: 'position', type: 'options', options: [{ name: 'Top', value: 'top' }, { name: 'Bottom', value: 'bottom' }], default: 'top', description: 'Banner position' },
          { displayName: 'Targeting', name: 'targeting', type: 'json', default: '{}', description: 'Targeting rules as JSON' },
          { displayName: 'Background Color', name: 'backgroundColor', type: 'string', default: '', description: 'Background color (hex)' },
          { displayName: 'Text Color', name: 'textColor', type: 'string', default: '', description: 'Text color (hex)' },
          { displayName: 'State', name: 'state', type: 'options', options: [{ name: 'All', value: '' }, { name: 'Published', value: 'published' }, { name: 'Draft', value: 'draft' }], default: '', description: 'Filter by state' },
          { displayName: 'Date From', name: 'dateFrom', type: 'string', default: '', description: 'Start date (ISO format)' },
          { displayName: 'Date To', name: 'dateTo', type: 'string', default: '', description: 'End date (ISO format)' },
        ],
      },

      // ==================== ANALYTICS OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['analytics'] } },
        options: [
          { name: 'Export Analytics', value: 'exportAnalytics', action: 'Export analytics', description: 'Export analytics data' },
          { name: 'Get Completion Metrics', value: 'getCompletionMetrics', action: 'Get completion metrics', description: 'Get completion rates' },
          { name: 'Get Engagement Metrics', value: 'getEngagementMetrics', action: 'Get engagement metrics', description: 'Get engagement data' },
          { name: 'Get Flows Overview', value: 'getFlowsOverview', action: 'Get flows overview', description: 'Get flows performance overview' },
          { name: 'Get Funnel Analysis', value: 'getFunnelAnalysis', action: 'Get funnel analysis', description: 'Get funnel data' },
          { name: 'Get Retention Data', value: 'getRetentionData', action: 'Get retention data', description: 'Get retention metrics' },
        ],
        default: 'getFlowsOverview',
      },

      // Analytics: dateFrom and dateTo (required for all)
      {
        displayName: 'Date From',
        name: 'dateFrom',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['analytics'] } },
        default: '',
        description: 'Start date (ISO format)',
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['analytics'] } },
        default: '',
        description: 'End date (ISO format)',
      },

      // Analytics: flowId for funnel
      {
        displayName: 'Flow ID',
        name: 'flowId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['analytics'], operation: ['getFunnelAnalysis'] } },
        default: '',
        description: 'Flow ID for funnel analysis',
      },

      // Analytics: exportType
      {
        displayName: 'Export Type',
        name: 'exportType',
        type: 'options',
        required: true,
        displayOptions: { show: { resource: ['analytics'], operation: ['exportAnalytics'] } },
        options: [
          { name: 'Flows', value: 'flows' },
          { name: 'Users', value: 'users' },
          { name: 'Events', value: 'events' },
        ],
        default: 'flows',
        description: 'Type of data to export',
      },

      // Analytics: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['analytics'] } },
        options: [
          { displayName: 'Flow IDs', name: 'flowIds', type: 'string', default: '', description: 'Comma-separated flow IDs to filter' },
          { displayName: 'Segment ID', name: 'segmentId', type: 'string', default: '', description: 'Filter by segment' },
          { displayName: 'Granularity', name: 'granularity', type: 'options', options: [{ name: 'Day', value: 'day' }, { name: 'Week', value: 'week' }, { name: 'Month', value: 'month' }], default: 'day', description: 'Time granularity' },
          { displayName: 'Cohort Type', name: 'cohortType', type: 'string', default: '', description: 'Cohort type for retention' },
          { displayName: 'Format', name: 'format', type: 'options', options: [{ name: 'JSON', value: 'json' }, { name: 'CSV', value: 'csv' }], default: 'json', description: 'Export format' },
        ],
      },

      // ==================== ACCOUNT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['account'] } },
        options: [
          { name: 'Create API Key', value: 'createApiKey', action: 'Create API key', description: 'Create a new API key' },
          { name: 'Delete API Key', value: 'deleteApiKey', action: 'Delete API key', description: 'Delete an API key' },
          { name: 'Get Account', value: 'getAccount', action: 'Get account', description: 'Get account details' },
          { name: 'Invite Member', value: 'inviteMember', action: 'Invite member', description: 'Invite a team member' },
          { name: 'List API Keys', value: 'listApiKeys', action: 'List API keys', description: 'List all API keys' },
          { name: 'List Team Members', value: 'listTeamMembers', action: 'List team members', description: 'List all team members' },
          { name: 'Remove Member', value: 'removeMember', action: 'Remove member', description: 'Remove a team member' },
          { name: 'Update Account', value: 'updateAccount', action: 'Update account', description: 'Update account settings' },
          { name: 'Update Member Role', value: 'updateMemberRole', action: 'Update member role', description: 'Change member role' },
        ],
        default: 'getAccount',
      },

      // Account: memberId
      {
        displayName: 'Member ID',
        name: 'memberId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['removeMember', 'updateMemberRole'] } },
        default: '',
        description: 'The unique identifier for the member',
      },

      // Account: apiKeyId
      {
        displayName: 'API Key ID',
        name: 'apiKeyId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['deleteApiKey'] } },
        default: '',
        description: 'The unique identifier for the API key',
      },

      // Account: email for invite
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['inviteMember'] } },
        default: '',
        description: 'Email address to invite',
      },

      // Account: role
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['inviteMember', 'updateMemberRole'] } },
        options: [
          { name: 'Admin', value: 'admin' },
          { name: 'Publisher', value: 'publisher' },
          { name: 'Reader', value: 'reader' },
        ],
        default: 'reader',
        description: 'Member role',
      },

      // Account: keyName and permissions for createApiKey
      {
        displayName: 'Key Name',
        name: 'keyName',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['createApiKey'] } },
        default: '',
        description: 'Name for the API key',
      },
      {
        displayName: 'Permissions',
        name: 'permissions',
        type: 'options',
        required: true,
        displayOptions: { show: { resource: ['account'], operation: ['createApiKey'] } },
        options: [
          { name: 'Admin', value: 'admin' },
          { name: 'Publisher', value: 'publisher' },
          { name: 'Reader', value: 'reader' },
        ],
        default: 'reader',
        description: 'Permission level for the API key',
      },

      // Account: returnAll / limit
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['account'], operation: ['listTeamMembers', 'listApiKeys'] } },
        default: false,
        description: 'Whether to return all results',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['account'], operation: ['listTeamMembers', 'listApiKeys'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: 'Max number of results to return',
      },

      // Account: updateFields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['account'], operation: ['updateAccount'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Account name' },
          { displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'Account timezone' },
          { displayName: 'Default Locale', name: 'defaultLocale', type: 'string', default: '', description: 'Default locale' },
        ],
      },

      // Account: additionalFields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['account'], operation: ['inviteMember'] } },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Member name' },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Log licensing notice once per execution
    logLicensingNotice(this);

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'user':
            switch (operation) {
              case 'getUser': result = await user.getUser.call(this, i); break;
              case 'updateUser': result = await user.updateUser.call(this, i); break;
              case 'trackEvent': result = await user.trackEvent.call(this, i); break;
              case 'getRecentEvents': result = await user.getRecentEvents.call(this, i); break;
              case 'bulkImportProfiles': result = await user.bulkImportProfiles.call(this, i); break;
              case 'bulkImportEvents': result = await user.bulkImportEvents.call(this, i); break;
              case 'deleteUser': result = await user.deleteUser.call(this, i); break;
              case 'listUsers': result = await user.listUsers.call(this, i); break;
              case 'searchUsers': result = await user.searchUsers.call(this, i); break;
              case 'getUserFlowHistory': result = await user.getUserFlowHistory.call(this, i); break;
            }
            break;

          case 'group':
            switch (operation) {
              case 'getGroup': result = await group.getGroup.call(this, i); break;
              case 'updateGroup': result = await group.updateGroup.call(this, i); break;
              case 'bulkImportGroups': result = await group.bulkImportGroups.call(this, i); break;
              case 'deleteGroup': result = await group.deleteGroup.call(this, i); break;
              case 'listGroups': result = await group.listGroups.call(this, i); break;
              case 'searchGroups': result = await group.searchGroups.call(this, i); break;
              case 'getGroupUsers': result = await group.getGroupUsers.call(this, i); break;
              case 'addUserToGroup': result = await group.addUserToGroup.call(this, i); break;
              case 'removeUserFromGroup': result = await group.removeUserFromGroup.call(this, i); break;
            }
            break;

          case 'flow':
            switch (operation) {
              case 'listFlows': result = await flow.listFlows.call(this, i); break;
              case 'getFlow': result = await flow.getFlow.call(this, i); break;
              case 'publishFlow': result = await flow.publishFlow.call(this, i); break;
              case 'unpublishFlow': result = await flow.unpublishFlow.call(this, i); break;
              case 'getFlowAnalytics': result = await flow.getFlowAnalytics.call(this, i); break;
              case 'updateFlow': result = await flow.updateFlow.call(this, i); break;
              case 'duplicateFlow': result = await flow.duplicateFlow.call(this, i); break;
              case 'getFlowSteps': result = await flow.getFlowSteps.call(this, i); break;
              case 'archiveFlow': result = await flow.archiveFlow.call(this, i); break;
              case 'restoreFlow': result = await flow.restoreFlow.call(this, i); break;
              case 'previewFlow': result = await flow.previewFlow.call(this, i); break;
            }
            break;

          case 'segment':
            switch (operation) {
              case 'listSegments': result = await segment.listSegments.call(this, i); break;
              case 'getSegment': result = await segment.getSegment.call(this, i); break;
              case 'createSegment': result = await segment.createSegment.call(this, i); break;
              case 'updateSegment': result = await segment.updateSegment.call(this, i); break;
              case 'deleteSegment': result = await segment.deleteSegment.call(this, i); break;
              case 'addUsersToSegment': result = await segment.addUsersToSegment.call(this, i); break;
              case 'removeUsersFromSegment': result = await segment.removeUsersFromSegment.call(this, i); break;
              case 'getSegmentSize': result = await segment.getSegmentSize.call(this, i); break;
              case 'listSegmentUsers': result = await segment.listSegmentUsers.call(this, i); break;
              case 'cloneSegment': result = await segment.cloneSegment.call(this, i); break;
            }
            break;

          case 'checklist':
            switch (operation) {
              case 'listChecklists': result = await checklist.listChecklists.call(this, i); break;
              case 'getChecklist': result = await checklist.getChecklist.call(this, i); break;
              case 'createChecklist': result = await checklist.createChecklist.call(this, i); break;
              case 'updateChecklist': result = await checklist.updateChecklist.call(this, i); break;
              case 'deleteChecklist': result = await checklist.deleteChecklist.call(this, i); break;
              case 'publishChecklist': result = await checklist.publishChecklist.call(this, i); break;
              case 'unpublishChecklist': result = await checklist.unpublishChecklist.call(this, i); break;
              case 'getChecklistAnalytics': result = await checklist.getChecklistAnalytics.call(this, i); break;
              case 'getChecklistItems': result = await checklist.getChecklistItems.call(this, i); break;
              case 'getUserChecklistProgress': result = await checklist.getUserChecklistProgress.call(this, i); break;
            }
            break;

          case 'nps':
            switch (operation) {
              case 'listNpsSurveys': result = await nps.listNpsSurveys.call(this, i); break;
              case 'getNpsSurvey': result = await nps.getNpsSurvey.call(this, i); break;
              case 'getNpsResponses': result = await nps.getNpsResponses.call(this, i); break;
              case 'createNpsSurvey': result = await nps.createNpsSurvey.call(this, i); break;
              case 'updateNpsSurvey': result = await nps.updateNpsSurvey.call(this, i); break;
              case 'deleteNpsSurvey': result = await nps.deleteNpsSurvey.call(this, i); break;
              case 'publishNpsSurvey': result = await nps.publishNpsSurvey.call(this, i); break;
              case 'unpublishNpsSurvey': result = await nps.unpublishNpsSurvey.call(this, i); break;
              case 'getNpsAnalytics': result = await nps.getNpsAnalytics.call(this, i); break;
              case 'exportNpsData': result = await nps.exportNpsData.call(this, i); break;
            }
            break;

          case 'job':
            switch (operation) {
              case 'getJobStatus': result = await job.getJobStatus.call(this, i); break;
              case 'listJobs': result = await job.listJobs.call(this, i); break;
              case 'cancelJob': result = await job.cancelJob.call(this, i); break;
              case 'getJobResults': result = await job.getJobResults.call(this, i); break;
              case 'retryJob': result = await job.retryJob.call(this, i); break;
            }
            break;

          case 'event':
            switch (operation) {
              case 'listEventDefinitions': result = await event.listEventDefinitions.call(this, i); break;
              case 'getEventDefinition': result = await event.getEventDefinition.call(this, i); break;
              case 'createEventDefinition': result = await event.createEventDefinition.call(this, i); break;
              case 'updateEventDefinition': result = await event.updateEventDefinition.call(this, i); break;
              case 'deleteEventDefinition': result = await event.deleteEventDefinition.call(this, i); break;
              case 'getEventAnalytics': result = await event.getEventAnalytics.call(this, i); break;
              case 'trackServerEvent': result = await event.trackServerEvent.call(this, i); break;
            }
            break;

          case 'pin':
            switch (operation) {
              case 'listPins': result = await pin.listPins.call(this, i); break;
              case 'getPin': result = await pin.getPin.call(this, i); break;
              case 'createPin': result = await pin.createPin.call(this, i); break;
              case 'updatePin': result = await pin.updatePin.call(this, i); break;
              case 'deletePin': result = await pin.deletePin.call(this, i); break;
              case 'publishPin': result = await pin.publishPin.call(this, i); break;
              case 'unpublishPin': result = await pin.unpublishPin.call(this, i); break;
              case 'getPinAnalytics': result = await pin.getPinAnalytics.call(this, i); break;
            }
            break;

          case 'banner':
            switch (operation) {
              case 'listBanners': result = await banner.listBanners.call(this, i); break;
              case 'getBanner': result = await banner.getBanner.call(this, i); break;
              case 'createBanner': result = await banner.createBanner.call(this, i); break;
              case 'updateBanner': result = await banner.updateBanner.call(this, i); break;
              case 'deleteBanner': result = await banner.deleteBanner.call(this, i); break;
              case 'publishBanner': result = await banner.publishBanner.call(this, i); break;
              case 'unpublishBanner': result = await banner.unpublishBanner.call(this, i); break;
              case 'getBannerAnalytics': result = await banner.getBannerAnalytics.call(this, i); break;
            }
            break;

          case 'analytics':
            switch (operation) {
              case 'getFlowsOverview': result = await analytics.getFlowsOverview.call(this, i); break;
              case 'getEngagementMetrics': result = await analytics.getEngagementMetrics.call(this, i); break;
              case 'getCompletionMetrics': result = await analytics.getCompletionMetrics.call(this, i); break;
              case 'getFunnelAnalysis': result = await analytics.getFunnelAnalysis.call(this, i); break;
              case 'getRetentionData': result = await analytics.getRetentionData.call(this, i); break;
              case 'exportAnalytics': result = await analytics.exportAnalytics.call(this, i); break;
            }
            break;

          case 'account':
            switch (operation) {
              case 'getAccount': result = await account.getAccount.call(this, i); break;
              case 'updateAccount': result = await account.updateAccount.call(this, i); break;
              case 'listTeamMembers': result = await account.listTeamMembers.call(this, i); break;
              case 'inviteMember': result = await account.inviteMember.call(this, i); break;
              case 'removeMember': result = await account.removeMember.call(this, i); break;
              case 'updateMemberRole': result = await account.updateMemberRole.call(this, i); break;
              case 'listApiKeys': result = await account.listApiKeys.call(this, i); break;
              case 'createApiKey': result = await account.createApiKey.call(this, i); break;
              case 'deleteApiKey': result = await account.deleteApiKey.call(this, i); break;
            }
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
