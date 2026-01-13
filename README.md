# n8n-nodes-appcues

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Appcues, the product-led growth and user onboarding platform. This node provides **12 resources** with **95+ operations** for complete workflow automation including user management, event tracking, flow management, pins, banners, segments, NPS surveys, analytics, and account management.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

## Features

- **User Management**: Create, update, delete, search user profiles with custom properties
- **Event Tracking**: Track user events and define event schemas
- **Flow Control**: List, publish, unpublish, duplicate, archive flows and retrieve analytics
- **Segment Management**: Full CRUD with bulk user assignment and cloning
- **Group/Company Support**: Manage organization-level data with user membership
- **Checklist Management**: Create, update, publish checklists with progress tracking
- **NPS Surveys**: Full survey lifecycle with response analytics and export
- **Pins (Tooltips)**: Create and manage in-app tooltips
- **Banners**: Create and manage announcement banners
- **Analytics**: Comprehensive analytics including funnels and retention
- **Account Management**: Team members, roles, and API key management
- **Bulk Operations**: Import profiles, events, and groups at scale with NDJSON
- **Job Monitoring**: Track async import job status with retry capability

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-appcues`
5. Select **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-appcues
n8n start
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **Account ID** | Your Appcues Account ID (found in Studio settings) |
| **API Key** | API Key from Studio > Settings > Integrations > API Keys |
| **API Secret** | API Secret associated with your API Key |

## Resources & Operations (12 Resources, 95+ Operations)

### User (10 operations)
Get User, Update User, Track Event, Get Recent Events, List Users, Search Users, Get User Flow History, Bulk Import Profiles, Bulk Import Events, Delete User

### Group (9 operations)
Get Group, Update Group, Delete Group, List Groups, Search Groups, Get Group Users, Add User to Group, Remove User from Group, Bulk Import Groups

### Flow (11 operations)
List Flows, Get Flow, Update Flow, Publish Flow, Unpublish Flow, Duplicate Flow, Get Flow Analytics, Get Flow Steps, Archive Flow, Restore Flow, Preview Flow

### Segment (10 operations)
List Segments, Get Segment, Create Segment, Update Segment, Delete Segment, Get Segment Size, List Segment Users, Add Users to Segment, Remove Users from Segment, Clone Segment

### Checklist (10 operations)
List Checklists, Get Checklist, Create Checklist, Update Checklist, Delete Checklist, Publish Checklist, Unpublish Checklist, Get Checklist Analytics, Get Checklist Items, Get User Progress

### NPS (10 operations)
List NPS Surveys, Get NPS Survey, Create NPS Survey, Update NPS Survey, Delete NPS Survey, Publish NPS Survey, Unpublish NPS Survey, Get NPS Responses, Get NPS Analytics, Export NPS Data

### Job (5 operations)
Get Job Status, List Jobs, Cancel Job, Get Job Results, Retry Job

### Event (7 operations)
List Event Definitions, Get Event Definition, Create Event Definition, Update Event Definition, Delete Event Definition, Get Event Analytics, Track Server Event

### Pin (8 operations)
List Pins, Get Pin, Create Pin, Update Pin, Delete Pin, Publish Pin, Unpublish Pin, Get Pin Analytics

### Banner (8 operations)
List Banners, Get Banner, Create Banner, Update Banner, Delete Banner, Publish Banner, Unpublish Banner, Get Banner Analytics

### Analytics (6 operations)
Get Flows Overview, Get Engagement Metrics, Get Completion Metrics, Get Funnel Analysis, Get Retention Data, Export Analytics

### Account (9 operations)
Get Account, Update Account, List Team Members, Invite Member, Remove Member, Update Member Role, List API Keys, Create API Key, Delete API Key

## Trigger Node (15 Events)

- flow_started, flow_completed, flow_skipped
- step_started, step_completed, step_skipped, step_interacted
- form_submitted, form_field_submitted
- checklist_shown, checklist_completed, checklist_item_completed
- nps_shown, nps_score_submitted, nps_feedback_submitted

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Bad request - Check your parameters |
| 401 | Unauthorized - Verify API credentials |
| 403 | Forbidden - Check API key permissions |
| 404 | Not found - Resource doesn't exist |
| 422 | Validation error - Check data format |
| 429 | Rate limited - Reduce request frequency |
| 500 | Server error - Retry later |

## Development

```bash
npm install
npm run build
npm run lint
npm test
```

## Author

**Velocity BPA** - [velobpa.com](https://velobpa.com) | [GitHub](https://github.com/Velocity-BPA)

## Licensing

Licensed under **Business Source License 1.1**. Commercial use requires a license from Velocity BPA.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.
