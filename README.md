# n8n-nodes-appcues

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Appcues, enabling seamless user onboarding and experience management workflows. Supports 6 core resources including Users, Flows, Segments, Checklists, Surveys, and Analytics with full CRUD operations and advanced querying capabilities for data-driven user engagement automation.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![User Onboarding](https://img.shields.io/badge/User-Onboarding-green)
![Analytics](https://img.shields.io/badge/Product-Analytics-orange)
![Automation](https://img.shields.io/badge/Experience-Automation-purple)

## Features

- **User Management** - Create, update, delete, and query user profiles with custom properties and segmentation
- **Flow Control** - Manage onboarding flows, product tours, and user experience sequences programmatically  
- **Segment Operations** - Create dynamic user segments based on behavior, properties, and engagement metrics
- **Checklist Management** - Build and manage guided task lists and progress tracking for user adoption
- **Survey Integration** - Deploy and collect feedback through in-app surveys and NPS campaigns
- **Analytics Retrieval** - Extract engagement metrics, conversion data, and user behavior insights
- **Batch Processing** - Execute bulk operations for user imports, updates, and data synchronization
- **Event Tracking** - Monitor user interactions, completions, and custom event triggers

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-appcues`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-appcues
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-appcues.git
cd n8n-nodes-appcues
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-appcues
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Appcues API key from account settings | Yes |
| Account ID | Your Appcues account identifier | Yes |
| Environment | Production or sandbox environment | No |

## Resources & Operations

### 1. User

| Operation | Description |
|-----------|-------------|
| Create | Create new user profiles with properties and segments |
| Update | Modify existing user data and custom attributes |
| Get | Retrieve individual user details and engagement history |
| List | Query users with filtering, pagination, and sorting |
| Delete | Remove user profiles and associated data |
| Track Event | Log custom user actions and behavior events |

### 2. Flow

| Operation | Description |
|-----------|-------------|
| Create | Build new onboarding flows and product tours |
| Update | Modify flow content, triggers, and targeting rules |
| Get | Retrieve flow configuration and performance metrics |
| List | Browse available flows with status and analytics |
| Publish | Deploy flows to production environment |
| Archive | Deactivate and archive completed flows |

### 3. Segment

| Operation | Description |
|-----------|-------------|
| Create | Define user segments with behavioral and property criteria |
| Update | Modify segment rules and membership conditions |
| Get | Retrieve segment details and current user count |
| List | View all segments with membership statistics |
| Delete | Remove segments and update user assignments |
| Get Users | List users belonging to specific segments |

### 4. Checklist

| Operation | Description |
|-----------|-------------|
| Create | Build guided task lists and adoption workflows |
| Update | Modify checklist items, ordering, and completion logic |
| Get | Retrieve checklist configuration and completion rates |
| List | Browse checklists with progress and engagement metrics |
| Delete | Remove checklists and associated progress data |
| Track Progress | Update user progress and task completion status |

### 5. Survey

| Operation | Description |
|-----------|-------------|
| Create | Design feedback surveys and NPS campaigns |
| Update | Modify survey questions, triggers, and targeting |
| Get | Retrieve survey configuration and response data |
| List | View surveys with response rates and analytics |
| Delete | Remove surveys and associated response data |
| Get Responses | Export survey responses and feedback data |

### 6. Analytics

| Operation | Description |
|-----------|-------------|
| Get Metrics | Retrieve engagement and conversion analytics |
| Get Events | Export user event data and interaction logs |
| Get Funnel | Analyze flow completion and drop-off rates |
| Get Cohorts | Generate cohort analysis and retention metrics |
| Export Data | Bulk export analytics data for external analysis |

## Usage Examples

```javascript
// Create a new user with custom properties
{
  "resource": "user",
  "operation": "create",
  "userId": "user_12345",
  "properties": {
    "email": "john.doe@example.com",
    "name": "John Doe",
    "plan": "premium",
    "signupDate": "2024-01-15"
  }
}
```

```javascript
// Create a user segment for premium customers
{
  "resource": "segment", 
  "operation": "create",
  "name": "Premium Users",
  "criteria": {
    "properties": {
      "plan": "premium",
      "status": "active"
    },
    "events": {
      "payment_completed": {
        "within": "30d"
      }
    }
  }
}
```

```javascript
// Deploy an onboarding flow for new users
{
  "resource": "flow",
  "operation": "publish",
  "flowId": "flow_onboarding_2024",
  "targeting": {
    "segments": ["new_users"],
    "triggers": ["first_login"],
    "frequency": "once"
  }
}
```

```javascript
// Retrieve flow analytics and completion metrics
{
  "resource": "analytics",
  "operation": "get_funnel",
  "flowId": "flow_onboarding_2024",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": ["views", "completions", "drop_offs"]
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Authentication Failed | Invalid API key or account ID | Verify credentials in Appcues account settings |
| Rate Limit Exceeded | Too many API requests in time window | Implement delays between requests or use batch operations |
| User Not Found | Specified user ID does not exist | Check user ID format or create user first |
| Flow Not Published | Attempting to access unpublished flow | Publish flow before referencing in operations |
| Invalid Segment Criteria | Malformed segment rules or properties | Validate segment criteria format and property names |
| Survey Response Limit | Maximum survey responses reached | Archive old responses or upgrade account plan |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-appcues/issues)
- **Appcues API Documentation**: [https://docs.appcues.com/](https://docs.appcues.com/)
- **Appcues Community**: [https://community.appcues.com/](https://community.appcues.com/)