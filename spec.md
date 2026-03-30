# Lamu Sports Hub

## Current State

- Settings page has notification sound toggles, smart alert switches, content interest checkboxes, Rate the App, and FAQ — but smart alerts and content interests don't auto-save (require hitting 'Save Settings' button)
- MatchesPage still imports MOCK_MATCHES and MOCK_TEAMS from mockData; real FKF fixtures never show
- Match result update calls actor?.updateMatchScore() directly — fails for PIN/simple login users with no fallback
- AdminPanel match creation team dropdown only loads from backend (actor); local teams not merged in
- TopNav has a notification bell with badge count; count logic uses stale data — doesn't refresh after new notifications are added
- TeamsPage shows 20 FKF teams but has no section for officials to view/approve pending team registration requests
- MVPVotePage requires actor to load matches — fails silently for PIN users; shows empty state
- AdminPanel backendTeamsForMatch only loads backend teams; local teams not included in match creation dropdown
- Banners on Dashboard homepage are functional but user reports static — matchday alert relies on match start time

## Requested Changes (Diff)

### Add
- Local fallback for match result updates: save score/status to localStorage when actor call fails
- Pending registrations section in TeamsPage for officials (shows tick/reject controls)
- Auto-save smart alert switches without requiring Save button
- Auto-save content interest checkboxes without requiring Save button
- Local teams merged into match creation home/away team dropdowns
- MVP Vote fallback: load local matches and players when actor unavailable
- Local match score storage (lsh_local_match_scores) for offline match result editing

### Modify
- MatchesPage: replace MOCK_MATCHES/MOCK_TEAMS with real backend matches + local teams
- AdminPanel handleSaveMatch: add local score fallback when actor throws
- AdminPanel backendTeamsForMatch: merge local teams alongside backend teams
- TopNav unread badge: recalculate on every render via storage event
- Settings smart alert switches: call setLocalStore immediately on toggle (not just on Save)
- Settings content interests: call setLocalStore immediately on checkbox change

### Remove
- MOCK_MATCHES and MOCK_TEAMS imports from MatchesPage

## Implementation Plan

1. Add `lsh_local_match_scores` helpers to localStore (getLocalMatchScores, setLocalMatchScore)
2. Fix MatchesPage to load matches from backend with local team name lookup; fallback to empty state
3. Fix AdminPanel handleSaveMatch to save score locally on actor failure
4. Fix AdminPanel backendTeamsForMatch to merge local teams
5. Add pending registration approval section to TeamsPage (visible to officials only)
6. Fix MVPVotePage to use local players/matches as fallback
7. Fix Settings: smart alerts and content interests auto-save on change
8. Verify TopNav unread count refreshes dynamically
