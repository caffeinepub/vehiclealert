# KOCHUPARAMBIL Vehicle Alert

## Current State
App uses ICP backend + Internet Identity login. All vehicle data stored on-chain via backend calls.

## Requested Changes (Diff)

### Add
- localStorage-based vehicle CRUD
- localStorage-based settings persistence

### Modify
- App.tsx: Remove login, load directly to dashboard
- useQueries.ts: Replace backend calls with localStorage
- Settings.tsx: Remove Principal ID, save thresholds to localStorage
- Layout.tsx: Remove auth UI

### Remove
- LoginScreen, ProfileSetup components
- Internet Identity hooks
- All backend actor calls

## Implementation Plan
1. Rewrite useQueries.ts with localStorage data layer
2. Rewrite App.tsx to skip login
3. Update Settings, Layout, pages to remove auth deps
4. Validate and build
