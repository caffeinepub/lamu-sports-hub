# Lamu Sports Hub

## Current State
Full sports hub app with Motoko backend and React frontend. The backend has admin functions (`adminCreateUser`, `adminCreateTeam`, `createNews`, `updateNews`, `deleteNews`, `getAllNewsAdmin`) that check `AccessControl.isAdmin()`. The `isAdmin` function calls `getUserRole()` which does a `Runtime.trap("User is not registered")` when the caller principal is not in the access control map. This causes every add/create action to fail with a trap error, surfacing in the frontend as "Failed to add user. Please try again."

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend `access-control.mo`: make `isAdmin` do a safe lookup (returning false instead of trapping) when the caller is not registered in the access control map
- Backend `main.mo`: ensure all admin-gated functions (`adminCreateUser`, `adminCreateTeam`, `createNews`, `updateNews`, `deleteNews`, `getAllNewsAdmin`) use the safe isAdmin check and return a meaningful error instead of trapping on unregistered users

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend with a safe `isAdmin` helper that uses a switch/case on `userRoles.get(caller)` and returns false instead of trapping when the user is not found
2. Keep all existing data models, functions, and logic identical -- only fix the authorization check
