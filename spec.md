# Lamu Sports Hub

## Current State
Full-featured football app with Dashboard, Standings (auto-calculated), Teams, Players, Matches, Explore, EPL, Stats, Admin Panel, Settings, Notifications. Uses localStore.ts for local-first storage. Backend types in backend.d.ts. 20 FKF teams seeded via runMigrations().

## Requested Changes (Diff)

### Add
- **Players tab**: Follow/Unfollow button per player. Follower count displayed on player card and player profile. Stored in localStorage (`playerFollowers` key: `{ [playerId]: string[] }` tracking userIds). Show "X followers" on each player card.
- **Explore tab**: Officials can upload short video files directly (not just URLs). Use blob-storage component for file uploads. Non-officials see view-only. Video feed shows both uploaded files and existing YouTube embeds.
- **Teams tab**: Each team card/row has an "Overview" expandable section or navigates to team profile with overview (squad size, wins, losses, draws, goal stats, recent form).
- **Dashboard homepage redesign** with this exact layout:
  1. Top bar: App name + search icon
  2. Hero section: today's live match OR latest result (dynamic from fixtures data)
  3. Quick access cards: Teams | Players | Fixtures | News (clickable navigation)
  4. League table mini-preview (top 5 teams, columns: Pos, Team, Pts)
  5. Upcoming fixtures (3-5 upcoming, "View All" link)
  6. Explore videos horizontal scroll (1-3 videos)
  7. Latest news cards
  8. Featured Team of the Week (first in standings)
- **Standings table**: Must show ALL FKF teams (22 teams), not just 3. Fix any bug causing only 3 to appear.
- **Match stats entry → standings update**: When official enters match result via Admin Panel, standings auto-recalculate from all played matches immediately. The computeBackendStandings() function already works correctly — ensure all teams from localStore are passed to it, not just backend teams.

### Modify
- **localStore.ts**: Add `playerFollowers` storage functions: `getPlayerFollowers(playerId)`, `togglePlayerFollow(playerId, userId)`, `isFollowingPlayer(playerId, userId)`, `getFollowerCount(playerId)`.
- **PlayersPage.tsx**: Add follow button and follower count to each player card. Tapping follow/unfollow toggles immediately and updates count.
- **PlayerProfilePage.tsx**: Show follower count and follow button in profile header.
- **StandingsPage.tsx**: Fix to load teams from both backend AND localStore (merged), so all 22 FKF teams appear.
- **DashboardPage.tsx**: Full redesign per layout above.
- **ExplorePage.tsx**: Add file upload for officials using blob-storage. Video cards show both uploaded videos and YouTube embeds.
- **TeamsPage.tsx**: Add overview button/section per team.

### Remove
- Nothing removed

## Implementation Plan
1. Add player follower functions to localStore.ts
2. Update PlayersPage.tsx with follow button + count
3. Update PlayerProfilePage.tsx with follow button + count  
4. Fix StandingsPage.tsx to merge localStore teams + backend teams so all 22 show
5. Redesign DashboardPage.tsx with full 8-section layout
6. Update ExplorePage.tsx with file upload for officials
7. Update TeamsPage.tsx with team overview section
8. Validate build
