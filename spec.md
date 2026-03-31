# Lamu Sports Hub

## Current State
The app is a full-stack football league management app. Most features exist but several functional bugs persist:
- Dashboard banner reads localStorage once on mount (not reactive when admin sets it from AdminPanel)
- Match creation in AdminPanel doesn't load team dropdown when actor is null (PIN users see empty dropdown)
- Match result update (AdminPanel catch path) saves to `lsh_local_match_scores` but MatchesPage and the admin's match list never reads these local overrides — so status stays 'scheduled' even after editing locally
- Matches past 90 minutes stay as 'scheduled' instead of auto-updating to show as 'played'
- Notification badge in TopNav doesn't clear after user marks notifications as read (NotificationsPage doesn't dispatch `lsh:notifications-updated` event)
- MVP Vote page exists at `/mvp-vote/$matchId` but is not in the More menu — unreachable
- Smart Alerts and Content Interest changes save correctly but give no user feedback
- Pending registrations section in TeamsPage shows but approve/reject needs to also handle cases where registration form is not visible to non-officials
- No local fallback for match creation (only backend `actor?.createMatch()` is called, no localStorage fallback)
- Settings "Create Widget" / install prompt needs to be more functional and descriptive for Android users

## Requested Changes (Diff)

### Add
- `lsh_local_matches` in localStore: a list of locally created matches (for PIN users)
- `getLocalMatches()`, `addLocalMatch()`, `updateLocalMatchScore()` helper functions in localStore
- MVP Vote entry in `MORE_ITEMS` array in BottomNav.tsx — link to `/mvp-vote/latest` and make MVPVotePage handle no/missing matchId by showing the most recently played match
- Auto-mark match as 'played' display logic: when a match has status 'live' or 'scheduled' and current time > match time + 95 minutes, show as 'played' in MatchesPage
- Dispatch `lsh:notifications-updated` event inside `NotificationsPage.markAllRead` and `markOneRead` after state update
- Toast feedback in Settings when Smart Alerts or Content Interests change ("Preferences saved")
- "Create Home Screen Widget" section in Settings with instructions + Install button

### Modify
- **DashboardPage**: replace one-time `getLocalStore` for systemStatus with a `useState` + `useEffect` that re-reads on `storage` and `lsh:banner-updated` events, so the banner reactively appears when admin saves it
- **AdminPanelPage `handleSaveMatch`**: after catch path local save, also call `setBackendMatches` to update the in-memory list so the UI reflects the new score/status without requiring a backend fetch. If actor is null, the catch fallback must run directly (not just when backend call fails)
- **AdminPanelPage match creation**: load `getLocalTeams()` into `backendTeamsForMatch` immediately when the matches tab opens (don't wait for actor); merge with backend results if/when actor loads
- **AdminPanelPage `handleCreateMatch`**: if actor is null, use local fallback — save to `lsh_local_matches` and show toast indicating local save
- **MatchesPage**: merge `lsh_local_match_scores` overrides into matches list (overlay homeScore, awayScore, status from localStorage). Also merge `getLocalMatches()` into the displayed list
- **MatchesPage**: apply auto-status logic — if local status is 'live' or 'scheduled' and >= 95 min past kickoff, display as 'played'
- **TeamsPage `handleApproveReg`**: dispatch `storage` event after `addLocalTeam` to ensure team appears everywhere
- **AdminPanelPage system status save**: dispatch `lsh:banner-updated` event after saving so Dashboard picks it up

### Remove
- Nothing removed

## Implementation Plan
1. Add `getLocalMatches`, `addLocalMatch`, `updateLocalMatchScore` to localStore.ts
2. Fix DashboardPage to reactively read systemStatus from localStorage
3. Fix AdminPanelPage: load local teams for match dropdown immediately (no actor dependency), fix handleSaveMatch to update in-memory state on local save, add local match creation fallback, dispatch banner event on save
4. Fix MatchesPage: merge local match scores + local matches, apply auto-played logic for >95 min past kickoff
5. Fix NotificationsPage: dispatch `lsh:notifications-updated` after markAllRead/markOneRead
6. Add MVP Vote to BottomNav MORE_ITEMS, update MVPVotePage to work without a matchId
7. Add toast feedback on Smart Alerts / Content Interest changes in SettingsPage
8. Improve Settings Install/Widget section with clearer instructions
