# Lamu Sports Hub

## Current State
- Full Motoko backend with Users, Teams, Players, Matches, MVPVotes, Notifications
- 15-page React frontend with Admin Panel (CRUD for users/teams/matches), Dashboard, Standings, Leaderboard, Matchday Stories, Coach Dashboard, etc.
- Blob storage component is already selected (used for team logos and player photos)
- Admin panel uses mock data (MOCK_USERS, MOCK_TEAMS, MOCK_MATCHES) -- not wired to real backend calls
- Dashboard shows mock data only
- No News feature exists yet

## Requested Changes (Diff)

### Add
- **News post model** in backend: title, body text, photo (blob), author, timestamp, published flag
- Backend functions: createNews, getAllNews, getNews, updateNews, deleteNews (admin-only write, public read)
- **Add User form** in Admin Panel -- "Add User" button in Users tab opening a dialog with name, role, area, email fields
- **Add Team form** in Admin Panel -- "Add Team" button in Teams tab opening a dialog with name, area fields
- **News tab** in Admin Panel -- list news posts, add/edit/delete, photo upload per post
- **News & Notifications section on Dashboard home page** -- shows latest 3 news posts (photo + title + snippet) and latest unread notifications count/list, wired to real backend

### Modify
- Admin Panel Users tab: add an "Add User" button at the top
- Admin Panel Teams tab: add an "Add Team" button at the top
- Admin Panel: add a "News" tab alongside Users, Teams, Matches, Notify (tabs become 5: users, teams, matches, news, notify)
- Dashboard: add a "Latest News" card section at the bottom, pulling from backend `getAllNews`
- Dashboard: show notification count badge in TopNav (pulled from backend)

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend to add News model and CRUD functions
2. Update AdminPanelPage: add "Add User" dialog, "Add Team" dialog, "News" tab with photo upload, and wire Add User / Add Team to local state (simulate)
3. Add NewsCard component for reuse
4. Update DashboardPage: add Latest News section pulling from backend getAllNews, show real notification badge
5. Wire notification badge to TopNav
