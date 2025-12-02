Public edit enabled for listings
================================

Change summary
--------------
- Listing edit, update and delete routes are now accessible to anyone (no login or owner requirement).
- The listing details page (`views/listings/show.ejs`) now shows the Edit / Delete controls for everyone.

Security note
-------------
This change allows any visitor to modify or remove a listing. This is intentionally permissive and may be unsafe in production. Consider:

- Adding a simple confirmation page, moderation queue, or moderation policy.
- Restricting editing to logged-in users.
- Introducing a safer flow for anonymous updates (email verification, expiring tokens, owner claim).

If you want me to add safeguards (for example expiring edit tokens or email-based edit links), I can implement that next.
