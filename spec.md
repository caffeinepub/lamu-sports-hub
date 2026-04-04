# Lamu Sports Hub — UX MVP Overhaul

## Current State

- Homepage (DashboardPage) has many sections: hero match, quick access cards, Season at a Glance widget, news preview, upcoming fixtures, activity feed, team of the week, admin banners
- MatchesPage shows date tabs (Yesterday/Today/Tomorrow/All) with match cards that have LIVE badge + minute
- StandingsPage auto-calculates from match results
- SettingsPage has 8 sections including Share/Download, Smart Alerts, FAQ, Rate App, etc.
- `runMigrations()` is exported from localStore.ts but NEVER called anywhere in the app
- LocalFixture type exists but has no `reporterName` or `lastUpdated` fields
- No "Submit Match Result" public form for reporters
- No "Become a Reporter" button in Settings
- No verified/confirmed badge on match results
- SettingsPage has WhatsApp contact but no dedicated reporter CTA
- DashboardPage has too many sections — the critical live/today view is buried

## Requested Changes (Diff)

### Add
- Call `runMigrations()` in `main.tsx` before ReactDOM.createRoot renders (THIS IS THE CRITICAL FIX)
- `reporterName: string` and `lastUpdated: number` optional fields to `LocalFixture` type
- Reporter attribution display on match cards: "Reported by [name] · Updated X min ago"
- "Verified" badge (green checkmark) on match scores that have been officially confirmed
- Public "Submit Match Result" form — accessible without official login, shows all FKF teams in dropdowns, submits a pending result for official review
- "Become a Reporter" CTA section in SettingsPage (at the top of the action list) with WhatsApp button (wa.me/254705434375) and a clear call to action
- Submit Match page/section with: Team A, Team B, Score A, Score B, Scorer names, Match minute, your name (reporter), and a submit button
- Submitted results go to a "Pending Results" queue visible only in Admin Panel for officials to verify/approve
- "Reported by" and "Last updated" display on MatchCard components
- Hero section on DashboardPage simplified to show ONLY: active/upcoming match with largest focus, followed by Today's Matches list, then Table Preview — remove the Season at a Glance widget from above the fold

### Modify
- DashboardPage: Move "Today's Matches" section to top (just below the hero match), move league table preview to second position, push activity feed and news further down
- MatchCard: Show `reporterName` if present ("Reported by: [name]"), show `lastUpdated` as "Updated X min ago" below match status
- SettingsPage: Add "Reporter Tools" section near top with "Become a Reporter" (WhatsApp deep link) and "Submit Match Result" (navigates to submit form) buttons
- LocalFixture type: Add `reporterName?: string` and `lastUpdated?: number` fields
- localStore.ts: Add `addPendingMatchResult()` and `getPendingMatchResults()` functions for the reporter submission queue
- AdminPanelPage: Add "Pending Results" tab showing submissions from reporters, with approve/reject actions

### Remove
- Nothing is removed — existing features stay, layout/priority is shifted

## Implementation Plan

1. **Fix `main.tsx`**: Import `runMigrations` from `@/utils/localStore` and call it before render. This is the single most critical fix.

2. **localStore.ts additions**:
   - Add `reporterName?: string` and `lastUpdated?: number` to `LocalFixture`
   - Add `PendingMatchResult` type with: id, homeTeam, awayTeam, homeScore, awayScore, scorers, reporterName, submittedAt, status (pending/approved/rejected)
   - Add `addPendingMatchResult()`, `getPendingMatchResults()`, `approvePendingResult()`, `rejectPendingResult()` functions

3. **DashboardPage layout reorder**:
   - Keep hero match card at top
   - Move TodayMatchesSection directly below hero
   - Move standings preview to 3rd position
   - Activity feed and news further down
   - Remove Season at a Glance widget from above the fold (move to bottom or remove entirely)

4. **MatchesPage / MatchCard**:
   - Show "Reported by: [name]" if `reporterName` is set on a fixture
   - Show "Updated X min ago" if `lastUpdated` is set
   - Show green verified badge if result is officially confirmed

5. **SettingsPage**: Add "Reporter Tools" section at top with:
   - "Become a Reporter" button linking to WhatsApp (wa.me/254705434375)
   - "Submit Match Result" button navigating to the submit form

6. **New SubmitResultPage** (or sheet within SettingsPage/MatchesPage):
   - Home Team select (all FKF teams)
   - Away Team select
   - Home Score input
   - Away Score input
   - Scorer names textarea (optional)
   - Reporter Name input
   - Submit button → saves to `lsh_pending_results` in localStorage, shows success toast

7. **AdminPanelPage**: Add "Reports" or "Pending" tab:
   - List all pending match results from reporters
   - Approve button: marks official, updates the corresponding fixture score + sets reporterName + verified badge
   - Reject button: removes from queue
