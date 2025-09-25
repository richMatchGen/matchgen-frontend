# Feature Restrictions Guide

This guide explains how to implement feature restrictions with padlocks and greyed-out buttons for users with different pricing plans.

## Components Overview

### 1. FeatureRestrictedButton
A button component that automatically checks feature access and shows a padlock icon when the feature is restricted.

### 2. FeatureRestrictedElement
A wrapper component that can restrict any UI element with a lock overlay.

### 3. FeatureGate
An existing component that has been enhanced to use the new feature access hook.

### 4. useFeatureAccess Hook
A custom hook that provides feature access checking functionality.

## Usage Examples

### Basic Button Restriction

```jsx
import FeatureRestrictedButton from '../components/FeatureRestrictedButton';

<FeatureRestrictedButton
  featureCode="psd_processor"
  variant="contained"
  onClick={handleUpload}
  tooltipText="PSD processing requires SemiPro Gen or higher"
  upgradeDialogTitle="PSD Processing Feature"
  upgradeDialogDescription="Upload and process PSD files to extract design elements."
>
  Upload PSD
</FeatureRestrictedButton>
```

### Element Wrapper Restriction

```jsx
import FeatureRestrictedElement from '../components/FeatureRestrictedElement';

<FeatureRestrictedElement
  featureCode="team_management"
  tooltipText="Team management requires SemiPro Gen or higher"
  upgradeDialogTitle="Team Management Feature"
  upgradeDialogDescription="Invite and manage team members with different roles."
>
  <Card>
    <CardContent>
      {/* Your restricted content here */}
    </CardContent>
  </Card>
</FeatureRestrictedElement>
```

### Using the Hook Directly

```jsx
import useFeatureAccess from '../hooks/useFeatureAccess';

const MyComponent = () => {
  const { hasAccess, loading, subscriptionInfo } = useFeatureAccess('advanced_analytics');
  
  if (loading) return <CircularProgress />;
  
  return (
    <div>
      {hasAccess ? (
        <AdvancedAnalytics />
      ) : (
        <div>Feature not available in your plan</div>
      )}
    </div>
  );
};
```

## Feature Codes

The following feature codes are available in the system:

- `match_creation` - Create and manage match fixtures
- `psd_processor` - Upload and process PSD files
- `team_management` - Invite and manage team members
- `advanced_analytics` - Access to detailed analytics
- `bulk_operations` - Perform bulk operations
- `custom_branding` - Custom branding options
- `api_access` - API access for integrations

## Pricing Tiers

### Basic Gen (£9.99/month)
- Upcoming Fixture Posts
- Matchday Posts
- Starting XI Posts
- 1 Team
- Basic Templates

### SemiPro Gen (£14.99/month)
- All Basic Gen features
- Substitution Posts
- Half Time Posts
- Full Time Posts
- Enhanced Templates
- PSD Processing
- Team Management

### Prem Gen (£24.99/month)
- All SemiPro Gen features
- Goal Posts
- Player of the Match Posts
- Bespoke Templates
- Multiple Teams
- Advanced Analytics
- Custom Branding
- API Access

## Implementation Examples

### 1. PSD Processor Page
The PSD Processor page demonstrates how to restrict an entire upload section:

```jsx
<FeatureRestrictedElement
  featureCode="psd_processor"
  tooltipText="PSD processing requires SemiPro Gen or higher"
  upgradeDialogTitle="PSD Processing Feature"
  upgradeDialogDescription="Upload and process PSD files to extract design elements for your social media posts."
>
  <Card>
    {/* Upload form content */}
  </Card>
</FeatureRestrictedElement>
```

### 2. Team Management Page
The Team Management page shows how to restrict specific buttons:

```jsx
<FeatureRestrictedButton
  featureCode="team_management"
  variant="contained"
  startIcon={<AddIcon />}
  onClick={() => setInviteDialogOpen(true)}
  tooltipText="Team management requires SemiPro Gen or higher"
  upgradeDialogTitle="Team Management Feature"
  upgradeDialogDescription="Invite and manage team members with different roles and permissions."
>
  Invite Team Member
</FeatureRestrictedButton>
```

### 3. Create Match Page
The Create Match page demonstrates feature restriction on the main action button:

```jsx
<FeatureRestrictedButton
  featureCode="match_creation"
  variant="contained"
  size="large"
  onClick={handleCreate}
  tooltipText="Match creation requires Basic Gen or higher"
  upgradeDialogTitle="Match Creation Feature"
  upgradeDialogDescription="Create and manage match fixtures for your club's schedule."
>
  Create Match
</FeatureRestrictedButton>
```

## Customization Options

### Button Props
- `featureCode` - The feature code to check access for
- `tooltipText` - Tooltip text shown on hover
- `upgradeDialogTitle` - Title for the upgrade dialog
- `upgradeDialogDescription` - Description for the upgrade dialog
- `showUpgradeDialog` - Whether to show upgrade dialog (default: true)
- All standard Button props are supported

### Element Props
- `featureCode` - The feature code to check access for
- `fallback` - Custom fallback component to render when access is denied
- `tooltipText` - Tooltip text shown on hover
- `upgradeDialogTitle` - Title for the upgrade dialog
- `upgradeDialogDescription` - Description for the upgrade dialog
- `overlayStyle` - Custom styles for the lock overlay
- `disabledStyle` - Custom styles when element is disabled

## Visual Indicators

### Restricted Buttons
- Greyed out appearance (opacity: 0.6)
- Lock icon instead of original start icon
- Tooltip on hover explaining restriction
- Click opens upgrade dialog

### Restricted Elements
- Greyed out appearance with grayscale filter
- Lock overlay with lock icon and "Upgrade Required" text
- Tooltip on hover explaining restriction
- Click opens upgrade dialog

### Upgrade Dialog
- Shows current plan and features
- Shows recommended next tier
- Lists all features included in next tier
- Direct link to subscription management page

## Best Practices

1. **Use appropriate feature codes** - Make sure the feature code matches what's configured in the backend
2. **Provide clear tooltips** - Explain what tier is required for the feature
3. **Use descriptive dialog content** - Help users understand the value of upgrading
4. **Test with different subscription tiers** - Ensure restrictions work correctly
5. **Consider user experience** - Don't over-restrict features that are core to the user experience

## Backend Integration

The components automatically integrate with the existing backend feature access system:

- `GET /api/users/feature-access/?club_id={id}` - Check feature access
- `GET /api/users/features/` - Get feature information
- Feature codes are defined in the `Feature` model
- Subscription tiers are defined in the `Club` model

## Troubleshooting

### Common Issues

1. **Feature not restricted** - Check that the feature code exists in the backend
2. **Access always denied** - Verify the user has a valid club and subscription
3. **Dialog not opening** - Ensure `showUpgradeDialog` is true
4. **Styling issues** - Check that custom styles don't conflict with restriction styles

### Debug Mode

You can add console logging to the `useFeatureAccess` hook to debug feature access issues:

```jsx
const { hasAccess, loading, subscriptionInfo } = useFeatureAccess('your_feature_code');
console.log('Feature access:', { hasAccess, loading, subscriptionInfo });
```




