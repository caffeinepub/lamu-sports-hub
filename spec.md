# Lamu Sports Hub

## Current State
A full-stack sports management app with 26 pages, bottom nav with a "More" sheet, Admin Panel with tabs for Users, Teams, Matches, News, Players, Referees, Awards, Officials, Settings, Inbox, Admins, and Recovery. Add User, Add Team, and Add News dialogs exist inside the Admin Panel page only.

## Requested Changes (Diff)

### Add
- Three new quick-action icon tiles inside the "More" bottom sheet, visible only to admins:
  - "Add Player" — opens a sheet/dialog to register a new player (name, position, team, jersey number, description/bio)
  - "Add Coach" — opens a sheet/dialog to register a new coach (name, area, contact, description of coaching style/experience)
  - "Add News" — opens a sheet/dialog to create and publish a news post (title, body, photo upload, publish toggle)
- A role-aware section header "Officials Quick Actions" above these three tiles in the More sheet, shown only when role === "admin"

### Modify
- BottomNav component: accept and pass `role` prop into the More sheet render; show the three new quick-action tiles only when role is "admin"
- The three dialogs/sheets within BottomNav are self-contained mini-forms that call the same backend APIs already wired in AdminPanelPage (adminCreateUser for players/coaches, createNews for news)

### Remove
- Nothing removed

## Implementation Plan
1. Update BottomNav to receive and use `role` prop (already received, just needs to be threaded into the More sheet render)
2. Add three quick-action tiles in the More sheet under an "Officials Quick Actions" section, visible only when role === "admin"
3. Implement three Dialog components inline in BottomNav (or extract to a small helper component):
   - AddPlayerQuickDialog: name, team selector (from mock teams), position select, jersey number, short bio/description
   - AddCoachQuickDialog: name, area select, phone, email, coaching description
   - AddNewsQuickDialog: title, body textarea, publish toggle, photo upload button
4. Wire each dialog to call actor APIs via useActor hook
5. Show toast feedback on success/failure
