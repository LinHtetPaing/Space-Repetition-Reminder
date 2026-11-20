# Calendar and Reminders

Signed-in learners see review schedules on a month calendar and complete due reviews from an in-app queue. Civil dates and the browser IANA timezone drive every API call.

## Sub-features

- `calendar-month` loads `GET /reviews/calendar` for the visible month (`from`, `to`, `timezone`) and shows a month grid with review counts.
- `calendar-day-detail` lists title and status for the selected civil day.
- `reminders-due` loads `GET /reviews/due?timezone=` for today and lists pending reviews.
- `reminders-complete` posts `POST /reviews/:id/complete`, then refreshes the due list so the row disappears.
- `calendar-reminders-nav` reaches `/calendar` and `/reminders` from the dashboard (and cross-links from Task Cards).

## How to get to it (user POV)

- Sign in, open Dashboard, choose Calendar or Reminders.
- On Calendar, move months, select a day, read the review list for that day.
- On Reminders, complete a due review and confirm it leaves the list.

## Driving it with Cursor IDE browser

Preconditions:

- `helpers/doctor.sh` exits `0`.
- Auth routes work (see [auth-register-login.md](./auth-register-login.md)).
- At least one Task Card exists so schedule rows were generated on create.
- For **Complete** on Reminders: a Pending review whose civil date is **today** in the browser timezone. Creating a card today is not enough (default first interval is +1 day). Arrange due-today via API/DB update of `scheduledFor`, or wait until day-1 lands on today.
- API exposes `GET /reviews/calendar`, `GET /reviews/due`, and `POST /reviews/:id/complete` with session cookies.

- **Register or log in.** Reach `/dashboard`.
- **Open Calendar.** Browser reaches `/calendar`. Month grid loads with the browser timezone in the subtitle.
- **Select a day.** Day detail shows titles and Pending or Completed status when reviews exist.
- **Open Reminders.** Browser reaches `/reminders`. Due-today list loads for the same timezone.
- **Complete.** Choose Complete on a pending row. List refreshes without that review.
- **Proof.** Save screenshots and an accessibility snapshot under `artifacts/calendar-reminders/`.

## Gotchas

- Pass IANA `timezone` on every calendar and due request. Default is `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Calendar returns only days that have reviews. Empty days are valid and show "No reviews on this day."
- Default intervals start at **1 day**, so a brand-new card usually shows **Nothing due today** on Reminders until a Pending row falls on today's civil date.
- Due returns Pending reviews for the civil `on` date (defaults to today in that timezone). Completing a review that is already Completed returns conflict from the API. The API Complete endpoint does not require due-today; the Reminders UI only lists due-today rows.
- Unauthenticated `/calendar` and `/reminders` redirect to `/login` after `GET /auth/me` returns 401, same as the dashboard.
- Web calls the API at `NEXT_PUBLIC_API_URL` with `credentials: "include"`.
