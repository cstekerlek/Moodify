# Moodify Firestore Security Specification (Phase 0)

## Data Invariants
1. Public catalog collections (`/moodCategories`, `/languages`, `/customTracks`, `/curatedPlaylists`) are readable by all visitors (`get`, `list`), and writable strictly by verified admins (`isAdmin()`).
2. `/users/{uid}` contains user profile and preference fields and MUST NOT be readable or writable by other users (`isOwner(uid)` or `isAdmin()`).
3. `/users/{uid}/favorites/{trackId}` and `/users/{uid}/playlists/{playlistId}` strictly require `isOwner(uid)` and enforce `incoming().uid == uid` and `uid == request.auth.uid`.
4. All document IDs (`categoryId`, `langCode`, `trackId`, `playlistId`, `uid`) are validated with `isValidId()`.
5. Every string field enforces strict `.size()` bounds and every array field enforces strict `.size() <= MAX` bounds.
6. Timestamps (`createdAt`, `updatedAt`) are strictly validated against `request.time` on write, and `createdAt` / `uid` are immutable on update.
7. Default-deny catch-all rule (`match /{document=**} { allow read, write: if false; }`) sits at the top of `/databases/{database}/documents`.

## Dirty Dozen Rejection Matrix
1. Non-admin writes to `/moodCategories/happy` -> PERMISSION_DENIED
2. Non-admin writes to `/customTracks/trk1` -> PERMISSION_DENIED
3. Non-admin writes to `/curatedPlaylists/pl1` -> PERMISSION_DENIED
4. Non-admin writes to `/languages/tr` -> PERMISSION_DENIED
5. Unauthenticated read on `/users/u1` -> PERMISSION_DENIED
6. Cross-user read (`u2` reading `/users/u1`) -> PERMISSION_DENIED
7. Cross-user write (`u2` creating `/users/u1/favorites/t1`) -> PERMISSION_DENIED
8. Identity spoofing (`u1` creating `/users/u1/playlists/p1` with `uid: "u2"`) -> PERMISSION_DENIED
9. Shadow field injection (`u1` creating `/users/u1` with `role: "admin"` or `isAdmin: true`) -> PERMISSION_DENIED
10. Unverified email spoofing admin email (`email: "cstekerlek@gmail.com", email_verified: false`) -> PERMISSION_DENIED
11. Unbounded array poisoning (`trackIds` with 500 entries) -> PERMISSION_DENIED
12. Invalid path ID (`../etc/passwd` or 300-char ID) -> PERMISSION_DENIED
