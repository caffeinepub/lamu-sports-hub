# Lamu Sports Hub

## Current State
- Full app with Admin Panel, Coach Dashboard, news system, and player management
- Backend has `createNews`, `adminCreateUser`, `createPlayer`, `adminCreateTeam` functions
- `getUserRole` in access-control.mo calls `Runtime.trap("User is not registered")` for any principal not in the ACL map -- this causes ALL write operations to crash for any user who hasn't gone through `_initializeAccessControlWithSecret`
- News posting in Admin Panel calls `actor.createNews(...)` but the backend rejects it because `hasPermission` traps instead of returning false
- Player registration in CoachDashboardPage uses mock setTimeout -- never calls the backend
- Admin Players tab in AdminPanelPage also uses mock data (MOCK_PLAYERS) -- never persists to backend
- The `createPlayer` backend function requires the caller to be both a registered user AND the team's coach OR admin

## Requested Changes (Diff)

### Add
- Backend: `addPlayer` admin function that allows any registered admin/user to add a player to any team (bypasses coach restriction) -- used for officials
- Backend: new `createNewsOpen` path -- allow `createNews` to work without the user role check trapping, by making `hasPermission` return false gracefully

### Modify
- Backend: `getUserRole` in access-control.mo -- return `#guest` instead of trapping when user is not registered, so `hasPermission` returns false gracefully instead of crashing
- Backend: `createPlayer` -- relax restriction so admins can create players for any team
- Frontend AdminPanelPage: Players tab -- wire "Add Player" button and confirmation checkboxes to backend (currently mock only)
- Frontend AdminPanelPage: News tab -- ensure `createNews` succeeds by ensuring actor is initialized before call
- Frontend CoachDashboardPage: `handleAddPlayer` -- call `actor.createPlayer(...)` for real instead of setTimeout mock
- Frontend AdminPanelPage: Add Player quick form (from More menu) -- connect to real backend `createPlayer` call

### Remove
- Nothing removed

## Implementation Plan
1. Fix `getUserRole` in access-control.mo to return `#guest` instead of trapping for unregistered users
2. Fix `createPlayer` backend to allow admins to add players to any team
3. Add a backend `adminAddPlayer` function that takes teamId + full player fields and does not require the coach restriction
4. In AdminPanelPage Players tab, add a real "Add Player" dialog that calls backend `createPlayer` with team selection
5. In CoachDashboardPage, wire `handleAddPlayer` to call backend `createPlayer` for real
6. Keep news posting as-is (it should now work after the getUserRole fix)
7. After backend fix, confirm news + player flows work end-to-end
