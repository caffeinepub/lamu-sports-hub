# Lamu Sports Hub

## Current State
- Admin Panel has team editing dialog but `handleSaveTeam` only does a fake setTimeout — no actual backend call, so edits never persist
- Teams tab in Admin Panel has no delete button for individual teams
- Players tab in Admin Panel has no delete button per player
- Team edit dialog has no logo upload field (logo upload only works via a separate icon button on the row outside the dialog)
- Officials section (AdminOfficialsTab) initialises with 4 hardcoded seed people: Said Joseph, Fatuma Hassan, Omar Abdallah, Amina Juma
- Referees section (AdminRefereesTab) initialises with 3 hardcoded seed referees: Mohamed Shariff, Abdalla Kombo, Ibrahim Salim
- The `localStore.ts` seed data for both Officials and Referees is loaded on first render via `getReferees()` / `getOfficials()` which fall back to SEED data if localStorage is empty
- Profile page already has a Camera button for own profile photo upload (working)

## Requested Changes (Diff)

### Add
- Delete button (red trash icon) on each team row in TeamsTabContent, with a confirmation dialog before deleting. Since backend has no deleteTeam function, delete from the local state and show a toast. The team list should refresh from backend but exclude the deleted team IDs stored locally.
- Delete button (red trash icon) on each player row in AdminPlayersTab, with a confirmation dialog. Use `actor.createPlayer` workaround — since there is no deletePlayer in backend.d.ts, mark the player as deleted in localStorage and filter them from the displayed list.
- Team logo upload field inside the Edit Team dialog (in addition to keeping the existing row icon button) — so when editing a team, there is a preview + upload button right in the dialog
- Player profile picture upload inside each player row (already exists as a button) — ensure it persists correctly and shows the photo on the player card

### Modify
- `handleSaveTeam`: currently does fake setTimeout; replace with a real call that at least saves the team name and area to localStorage as an override (since backend has no updateTeam function), then refreshes the team list. Show a success toast with the actual new team name.
- `getReferees()` in localStore.ts: change so it returns `[]` (empty array) instead of SEED_REFEREES when localStorage has no data. Remove the SEED_REFEREES seed. Officials should start empty too.
- `getOfficials()` in localStore.ts: change so it returns `[]` (empty array) instead of SEED_OFFICIALS when localStorage has no data. Remove the SEED_OFFICIALS seed.
- `getAwards()` in localStore.ts: change so it returns `[]` instead of SEED_AWARDS. Remove demo award data.

### Remove
- SEED_REFEREES constant and its usage in getReferees()
- SEED_OFFICIALS constant and its usage in getOfficials()
- SEED_AWARDS constant and its usage in getAwards()
- Demo data that would confuse officials trying to enter real data

## Implementation Plan

1. **localStore.ts** — Remove SEED_REFEREES, SEED_OFFICIALS, SEED_AWARDS. Update getReferees/getOfficials/getAwards to return [] when localStorage is empty. Add a `LSH_TEAM_OVERRIDES_KEY` for storing team name/area edits and `LSH_DELETED_TEAMS_KEY` / `LSH_DELETED_PLAYERS_KEY` for soft-deletes.

2. **AdminPanelPage.tsx** — TeamsTabContent:
   - Add delete button with confirmation dialog per team row
   - On confirm: store teamId in `LSH_DELETED_TEAMS_KEY` in localStorage, remove from local state, toast success
   - Filter displayed teams against deleted IDs
   - Pass a `onTeamLogoChange` callback so logo can also be uploaded inside the edit dialog

3. **AdminPanelPage.tsx** — handleSaveTeam:
   - Store `{ teamId, name, area }` in localStorage overrides map
   - Update local displayed teams state immediately with the new name/area
   - Close dialog and toast success with the real new name

4. **AdminPanelPage.tsx** — Edit Team dialog:
   - Add logo upload section (same pattern as Add News photo upload) — file input, preview thumbnail, upload button
   - On file selected, call setTeamLogo and refresh teamLogos state

5. **AdminPanelPage.tsx** — AdminPlayersTab:
   - Add delete button per player row
   - On confirm: store playerId in `LSH_DELETED_PLAYERS_KEY` in localStorage, filter from displayed list
   - Keep photo upload and confirmation checkbox as-is
