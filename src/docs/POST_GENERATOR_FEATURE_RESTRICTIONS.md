# Post Generator Feature Restrictions Implementation

## Overview
This document describes the implementation of feature restrictions with lock icons for the Social Media Post Generator, specifically targeting Goal and Substitution post generation features for users on the Basic plan.

## Features Implemented

### 1. Visual Lock Indicators
- **Lock Icons**: Restricted post types show a lock icon instead of their original icon
- **Disabled State**: Restricted tabs are visually disabled with reduced opacity
- **Upgrade Chips**: "Upgrade Required" chips appear next to restricted feature names
- **Greyed Out Text**: Restricted features have disabled text colors

### 2. Interactive Restrictions
- **Tab Disabled**: Users cannot click on restricted post type tabs
- **Generate Button Disabled**: The generate button shows "Upgrade Required" for restricted features
- **Warning Messages**: Snackbar notifications inform users when they try to access restricted features

### 3. Feature Access Checking
- **Real-time Access Check**: Component checks user's feature access on load
- **Cached Access Data**: Feature access is cached to avoid repeated API calls
- **Loading States**: Shows loading spinner while checking feature access

## Post Type Restrictions by Plan

### Basic Gen Plan (£9.99/month)
**Available Features:**
- ✅ Upcoming Fixture Posts
- ✅ Matchday Posts  
- ✅ Starting XI Posts

**Restricted Features:**
- 🔒 Substitution Posts (requires SemiPro Gen)
- 🔒 Half Time Posts (requires SemiPro Gen)
- 🔒 Full Time Posts (requires SemiPro Gen)
- 🔒 Goal Posts (requires Prem Gen)
- 🔒 Player of the Match Posts (requires Prem Gen)

### SemiPro Gen Plan (£14.99/month)
**Available Features:**
- ✅ All Basic Gen features
- ✅ Substitution Posts
- ✅ Half Time Posts
- ✅ Full Time Posts

**Restricted Features:**
- 🔒 Goal Posts (requires Prem Gen)
- 🔒 Player of the Match Posts (requires Prem Gen)

### Prem Gen Plan (£24.99/month)
**Available Features:**
- ✅ All features available

## Implementation Details

### Component Updates

#### MatchdayPostGenerator.jsx
1. **Added Imports**:
   ```jsx
   import { Lock as LockIcon } from '@mui/icons-material';
   import useFeatureAccess from '../hooks/useFeatureAccess';
   ```

2. **Added State**:
   ```jsx
   const [featureAccess, setFeatureAccess] = useState({});
   const [accessLoading, setAccessLoading] = useState(true);
   ```

3. **Feature Access Check Function**:
   ```jsx
   const checkFeatureAccess = async () => {
     // Fetches user's feature access from API
     // Caches the results for performance
   };
   ```

4. **Updated Tab Rendering**:
   ```jsx
   {POST_TYPES.map((postType) => {
     const hasAccess = featureAccess[postType.featureCode] || false;
     const isRestricted = !hasAccess;
     
     return (
       <Tab
         disabled={isRestricted}
         label={
           <Box>
             {isRestricted ? <LockIcon /> : postType.icon}
             {isRestricted && <Chip label="Upgrade Required" />}
           </Box>
         }
       />
     );
   })}
   ```

5. **Updated Generate Button**:
   ```jsx
   <Button
     disabled={isRestricted}
     startIcon={isRestricted ? <LockIcon /> : <Image />}
   >
     {isRestricted ? 'Upgrade Required' : 'Generate Post'}
   </Button>
   ```

### Feature Codes Used
- `post.upcoming` - Upcoming Fixture Posts
- `post.matchday` - Matchday Posts
- `post.startingxi` - Starting XI Posts
- `post.substitution` - Substitution Posts
- `post.halftime` - Half Time Posts
- `post.fulltime` - Full Time Posts
- `post.goal` - Goal Posts
- `post.potm` - Player of the Match Posts

## User Experience

### For Basic Plan Users
1. **Visual Feedback**: Lock icons clearly indicate restricted features
2. **Clear Messaging**: "Upgrade Required" chips and warning messages
3. **Prevented Actions**: Cannot select or generate restricted post types
4. **Upgrade Path**: Clear indication of what features are available in higher tiers

### For Higher Tier Users
1. **Full Access**: All features work normally
2. **No Restrictions**: No visual indicators of restrictions
3. **Seamless Experience**: No changes to existing functionality

## Backend Integration

The implementation integrates with the existing backend feature access system:

- **API Endpoint**: `GET /api/users/feature-access/?club_id={id}`
- **Feature Codes**: Defined in the `Feature` model
- **Subscription Tiers**: Managed through the `Club` model
- **Access Control**: Enforced at both frontend and backend levels

## Testing

### Manual Testing Steps
1. **Login as Basic Plan User**:
   - Verify Goal and Substitution tabs show lock icons
   - Verify "Upgrade Required" chips are visible
   - Verify tabs are disabled and cannot be clicked
   - Verify generate button shows "Upgrade Required"

2. **Login as SemiPro Plan User**:
   - Verify Goal and Player of the Match tabs show lock icons
   - Verify Substitution, Half Time, and Full Time tabs work normally

3. **Login as Prem Plan User**:
   - Verify all tabs work normally
   - Verify no lock icons are visible

### Error Handling
- **API Failures**: Gracefully handles feature access API failures
- **Loading States**: Shows loading spinner while checking access
- **Fallback Behavior**: Defaults to restricted state if access check fails

## Future Enhancements

1. **Upgrade Dialog**: Add upgrade dialog when users click on restricted features
2. **Feature Preview**: Show preview of restricted features to encourage upgrades
3. **Usage Analytics**: Track which restricted features users try to access
4. **Dynamic Pricing**: Show upgrade pricing directly in the interface

## Files Modified

- `matchgen-frontend/src/components/MatchdayPostGenerator.jsx` - Main implementation
- `matchgen-frontend/src/hooks/useFeatureAccess.js` - Feature access hook (existing)
- `matchgen-frontend/src/components/FeatureRestrictedButton.jsx` - Reusable button component (existing)
- `matchgen-frontend/src/components/FeatureRestrictedElement.jsx` - Reusable element wrapper (existing)

## Dependencies

- Material-UI components (Tabs, Tab, Chip, LockIcon)
- React hooks (useState, useEffect)
- Axios for API calls
- Existing feature access system


