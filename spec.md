# Lamu Sports Hub — Share Buttons & Addictive Features

## Current State
The app has MatchdayPage, MatchesPage, PlayerProfilePage, StandingsPage, LeaderboardPage, and a PredictionWidget component. There is a Share App button in Settings but no contextual share buttons throughout the app. Predictions exist via PredictionWidget. There are join/reaction features partially implemented.

## Requested Changes (Diff)

### Add
- **ShareButton utility component** — reusable `<ShareButton text={...} />` that calls `navigator.share()` on mobile (Web Share API) with fallback to copying text to clipboard + toast confirmation
- **Share on live/played match cards** — in MatchesPage and MatchdayPage, add a share button next to the score. Live matches auto-generate: "[Home] X - Y [Away] | FKF Lamu County League 🔴 LIVE [Minute]'". Played matches: "FULL TIME: [Home] X - Y [Away] | FKF Lamu County League ⚽"
- **Share goal events in match timeline** — in MatchdayPage timeline/events section, each goal event gets a share button that generates: "⚽ [Player] just scored at [Minute]'! [Team] lead [Score] 🔥 | Lamu Sports Hub"
- **Share result button** — prominent share button after FULL TIME in MatchdayPage: "FULL TIME: [Home] X - Y [Away]! [Winner] wins! 🏆 | FKF Lamu County League"
- **Share Player button** — on PlayerProfilePage, below the player stats, add share button generating: "[Name] ([Position]) | ⚽ [Goals] goals | [Team] | FKF Lamu County League — Lamu Sports Hub"
- **Share Table button** — on StandingsPage, a share button at the top that generates the current top-5 standings as text: "🏆 FKF Lamu County League Standings:\n1. [Team] — Pts\n2. [Team] — Pts...\nLamu Sports Hub"
- **Share My Prediction button** — after a user submits a prediction, show a share button: "My prediction: [Home] [X]-[Y] [Away] | FKF Lamu County League. What's yours? 🎯 | Lamu Sports Hub"
- **Quick Reactions** — on MatchdayPage and each match card in MatchesPage (live matches only), add 4 quick reaction buttons: 🔥 😡 😭 👏. Show aggregate count per reaction, stored in localStorage keyed by matchId. Tap to toggle your reaction.
- **Live Chat per match** — in MatchdayPage, add a "Chat" tab alongside the existing tabs (Live, Lineups, Momentum, Shots). Chat tab shows a scrollable message list and a text input at the bottom. Messages stored in localStorage keyed by matchId. Each message shows username (from local user profile), text, and time. Chat auto-scrolls to newest.
- **Mini text highlights ticker** — in live matches (MatchdayPage Live tab), show a scrolling or pulsing event ticker at the top: "🔥 Big Chance!", "⚽ GOAL!", "🟥 RED CARD!", "🟨 Yellow Card". Events drawn from match events already in the timeline.
- **Achievements / badges on LeaderboardPage** — add a Badges section below the leaderboard. Award badges: 🏆 Top Predictor, ⚽ Goal Reporter, 🔥 Most Active. Each badge has a share button: "I just earned the [Badge] badge on Lamu Sports Hub! 🏆"
- **"Watching Now" upgrade** — on MatchdayPage, upgrade the viewer count to show mini avatar circles (initials-based) for users who joined the match, plus count. "👁 [N] watching"

### Modify
- MatchCard shared component: add share button and quick reactions
- MatchdayPage: add Chat tab, quick reactions row, share result button, mini ticker, share goal per timeline event, upgraded watching now
- PlayerProfilePage: add share player button below stats
- StandingsPage: add share table button in header area
- PredictionWidget: add share prediction button after vote is cast
- LeaderboardPage: add badges section with share buttons

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/utils/shareUtils.ts` — `shareContent(text: string)` function using Web Share API with clipboard fallback
2. Create `src/frontend/src/components/shared/ShareButton.tsx` — small reusable button component with share icon, accepts `text` and optional `label` props
3. Create `src/frontend/src/components/shared/QuickReactions.tsx` — 4-emoji reaction bar with counts from localStorage
4. Modify `MatchesPage.tsx` — add ShareButton to each live/played match card
5. Modify `MatchdayPage.tsx` — add Chat tab, share result button, share goal per event, mini ticker, upgraded watching now, quick reactions
6. Modify `PlayerProfilePage.tsx` — add ShareButton below stats
7. Modify `StandingsPage.tsx` — add ShareButton in header
8. Modify `PredictionWidget.tsx` — add ShareButton after vote submitted
9. Modify `LeaderboardPage.tsx` — add Badges section with share buttons
