# Lamu Sports Hub

## Current State
The app has Matches page (list of scheduled FKF fixtures), PlayerProfilePage (basic stats), TeamsPage (grid of teams), SettingsPage (8 sections), MatchdayPage (live score editing). The app has EPL, Stats, Notifications, and Explore tabs.

## Requested Changes (Diff)

### Add
1. **Live Match Interface** on MatchesPage:
   - Top date tabs: Yesterday | Today | Tomorrow (filters matches)
   - "Following" section at top (user-curated tracked matches, starred by user)
   - Leagues section below, matches grouped by league/competition
   - Live indicators: green pill/circle showing current match minute (e.g. "82'" in green) for in-progress matches
   - Match cards show: home team, score, away team, status (upcoming/live/finished)

2. **Player Ratings & Lineups tab** on MatchdayPage:
   - Formation visual (e.g. 4-2-3-1) showing players on a pitch graphic
   - Each player icon has a color-coded rating badge (1–10 scale: red=low, yellow=mid, green=high)
   - Event icons next to player name/icon: ⚽ goal, 🟨 yellow card, 🔴 red card, ↕ substitution (red out, green in)

3. **Momentum Graph & Match Facts tab** on MatchdayPage:
   - Dual-colored area chart over 90 minutes (home team color above center, away team below)
   - Goal icons placed at the minute they occurred on the chart
   - Match stats section: Possession %, xG (Expected Goals), Total Shots

4. **Shot Map tab** on MatchdayPage:
   - Top-down pitch view with dot markers for shot attempts
   - Red dots = home team shots, grey = away team shots
   - Clicking a shot shows: xG value, xGOT value, foot used, situation (regular/set piece/counter), result (goal/saved/off target)

5. **Enhanced Player Profile** (PlayerProfilePage):
   - Biometrics row: height, age, nationality, preferred foot
   - Market value display (e.g. €190M)
   - Season stats card: matches, goals, assists, average rating
   - Radar/spider chart for player traits (Pace, Shooting, Passing, Dribbling, Defending, Physical)

6. **Notification Settings** in SettingsPage:
   - Toggle for notification sound on/off
   - Toggle per notification type (match start, goal alerts, news, admin messages)

7. **Rate the App** section in SettingsPage:
   - Star rating UI (1–5 stars)
   - Optional comment box
   - Submit button (saves rating locally, shows thank you message)

8. **FAQ Section** in SettingsPage or About page:
   - Accordion list of common questions and answers about the app

9. **Teams Tab Redesign** (TeamsPage):
   - Tab header highlighted in red when active (already styled but ensure red active state)
   - Teams displayed in a vertical list (not grid)
   - Each team row has: logo, team name, star icon to toggle favorite
   - Favorite teams shown at top with filled star
   - Teams grouped under "FOOTBALL" category header

### Modify
- MatchdayPage: Add tabs for Lineups, Momentum, Shot Map (alongside existing Live tab)
- PlayerProfilePage: Add biometrics, market value, radar chart
- SettingsPage: Add notification sound toggles, rate app section, FAQ section
- TeamsPage: Switch from grid to vertical list with star favorites

### Remove
- Nothing removed

## Implementation Plan
1. Update MatchesPage: add date tab filter (Yesterday/Today/Tomorrow), Following section (uses localStorage for starred matches), live minute indicator badges, group matches by league
2. Update MatchdayPage: add Lineups tab (formation visual + player rating cards), Momentum tab (recharts AreaChart), Shot Map tab (SVG pitch with dot markers)
3. Update PlayerProfilePage: add biometrics row, market value badge, radar chart (recharts RadarChart)
4. Update TeamsPage: vertical list layout, star toggle favorite per team, red active tab styling, "FOOTBALL" category header
5. Update SettingsPage: notification sound toggle section, rate-the-app star UI, FAQ accordion
