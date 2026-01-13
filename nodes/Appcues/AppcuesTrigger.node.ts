/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

import { logLicensingNotice } from './transport/GenericFunctions';
import { APPCUES_TRIGGER_EVENTS } from './constants/constants';

export class AppcuesTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Appcues Trigger',
    name: 'appcuesTrigger',
    icon: 'file:appcues.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when Appcues events occur',
    defaults: {
      name: 'Appcues Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'appcuesApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        options: [
          { name: 'All Events', value: '*', description: 'Trigger on all events' },
          { name: 'Checklist Completed', value: 'checklist_completed', description: 'Triggered when a user completes a checklist' },
          { name: 'Checklist Item Completed', value: 'checklist_item_completed', description: 'Triggered when a user completes a checklist item' },
          { name: 'Checklist Shown', value: 'checklist_shown', description: 'Triggered when a checklist is displayed' },
          { name: 'Flow Completed', value: 'flow_completed', description: 'Triggered when a user completes a flow' },
          { name: 'Flow Skipped', value: 'flow_skipped', description: 'Triggered when a user skips a flow' },
          { name: 'Flow Started', value: 'flow_started', description: 'Triggered when a user starts a flow' },
          { name: 'Form Field Submitted', value: 'form_field_submitted', description: 'Triggered when an individual form field is submitted' },
          { name: 'Form Submitted', value: 'form_submitted', description: 'Triggered when a user submits a form' },
          { name: 'NPS Feedback Submitted', value: 'nps_feedback_submitted', description: 'Triggered when NPS feedback text is submitted' },
          { name: 'NPS Score Submitted', value: 'nps_score_submitted', description: 'Triggered when an NPS score is submitted' },
          { name: 'NPS Shown', value: 'nps_shown', description: 'Triggered when an NPS survey is displayed' },
          { name: 'Step Completed', value: 'step_completed', description: 'Triggered when a user completes a step' },
          { name: 'Step Interacted', value: 'step_interacted', description: 'Triggered when a user interacts with a step' },
          { name: 'Step Skipped', value: 'step_skipped', description: 'Triggered when a user skips a step' },
          { name: 'Step Started', value: 'step_started', description: 'Triggered when a user starts a step' },
        ],
        default: '*',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Filter by Flow ID',
            name: 'flowId',
            type: 'string',
            default: '',
            description: 'Only trigger for events from this specific flow',
          },
          {
            displayName: 'Filter by User ID',
            name: 'userId',
            type: 'string',
            default: '',
            description: 'Only trigger for events from this specific user',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice(this);
        // Appcues uses client-side Events Broadcaster, not server-side webhooks
        // The webhook URL needs to be configured in the Appcues Events Broadcaster
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice(this);
        // No server-side webhook registration needed
        // User must configure Events Broadcaster in Appcues
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        // No server-side webhook deletion needed
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    logLicensingNotice(this);

    const bodyData = this.getBodyData() as IDataObject;
    const event = this.getNodeParameter('event') as string;
    const options = this.getNodeParameter('options', {}) as IDataObject;

    // Validate the incoming event
    const incomingEvent = bodyData.event_type as string;

    // Check if we should filter by event type
    if (event !== '*' && incomingEvent !== event) {
      return {
        noWebhookResponse: true,
      };
    }

    // Check if we should filter by flow ID
    if (options.flowId && bodyData.flow_id !== options.flowId) {
      return {
        noWebhookResponse: true,
      };
    }

    // Check if we should filter by user ID
    if (options.userId && bodyData.user_id !== options.userId) {
      return {
        noWebhookResponse: true,
      };
    }

    // Validate the event type is one we recognize
    if (incomingEvent && !APPCUES_TRIGGER_EVENTS.includes(incomingEvent as any) && event !== '*') {
      return {
        noWebhookResponse: true,
      };
    }

    // Add metadata to the response
    const enhancedData: IDataObject = {
      ...bodyData,
      _received_at: new Date().toISOString(),
      _trigger_event: event,
    };

    return {
      workflowData: [this.helpers.returnJsonArray([enhancedData])],
    };
  }
}
