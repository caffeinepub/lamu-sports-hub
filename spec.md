# Lamu Sports Hub

## Current State
The app has a two-layer auth system: (1) Official Access Code (`LSH2026`) verified in sessionStorage, and (2) `isCallerAdmin()` backend check. Both must pass for `role` to be set to `"admin"`. If `isCallerAdmin()` returns false (which it does for all users not explicitly added to the backend access control list), the Admin Panel shows a lock screen and the "Officials Quick Actions" in the More menu never appear — making Official Mode functionally identical to fan mode.

The backend (`adminAddPlayer`, `adminCreateTeam`, `createNews`, `adminCreateUser`) only requires `isAuthenticated` (non-anonymous), NOT admin role. So the backend is fine — the frontend gatekeeping is the blocker.

Team logos are stored in localStorage (not backend), which is fine for now.

## Requested Changes (Diff)

### Add
- App logo change option for officials (upload a new logo image from the Admin Panel Settings tab)
- An "Add Team" quick action tile in the More menu alongside Add Player and Add News

### Modify
- **Official Mode gate**: Change `role` logic so that if `isOfficialSessionVerified()` is true, role is set to `"admin"` regardless of `isCallerAdmin()` result. The Official Access Code IS the admin gate for the UI.
- **Admin Panel auth gate**: If `isOfficialSessionVerified()` is true, bypass the backend `isCallerAdmin()` check and render `AdminPanelInner` directly. Add a banner explaining the code-based access.
- **Add Team in More menu**: Add an "Add Team" quick action tile to the Officials Quick Actions section in the More sheet (alongside Add Player, Add Coach, Add News).
- **Add Team dialog in BottomNav**: Wire a full Add Team dialog (name, area, coach name) in BottomNav similar to Add Player.
- **Team logo upload**: In Admin Panel > Teams tab, the logo upload button should visually show a preview thumbnail after upload; store in localStorage keyed by teamId.
- **Official Mode visual distinction**: When Official Mode is active, show a clearly visible persistent indicator (gold/green pill) in the TopNav so it's obvious the user is in official mode at all times.

### Remove
- Nothing removed

## Implementation Plan
1. Update `App.tsx` role detection: if official session is verified, set role to `"admin"` immediately (don't wait for or require `isCallerAdmin()` to return true)
2. Update `AdminPanelPage.tsx` auth gate: if `isOfficialSessionVerified()` is true, skip the backend check and render `AdminPanelInner` directly
3. Update `BottomNav.tsx`: add `AddTeamDialog` component and "Add Team" tile to Officials Quick Actions
4. Update `TopNav.tsx`: show a persistent "Official Mode" gold pill badge when official session is active
5. Add app logo upload in Admin Panel Settings tab (stores logo in localStorage, frontend reads from there)
