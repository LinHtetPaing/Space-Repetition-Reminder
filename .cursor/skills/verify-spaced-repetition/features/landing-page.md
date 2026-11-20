# Landing page

The landing page shows the product name and a short study promise before auth exists.

## Sub-features

- `landing-load` serves HTTP 200 at `/`.
- `landing-brand` shows the heading `Spaced Repetition Reminder`.

## How to get to it (user POV)

- Open `http://localhost:3000/` in a browser.

## Driving it with Cursor IDE browser

Preconditions:

- `helpers/doctor.sh` exits `0`.
- Browser tools available in the agent session.

- **Open home.** Navigate to `http://localhost:3000/`. Snapshot shows a heading named `Spaced Repetition Reminder` and links named `Register` and `Log in`.
- **Proof.** Save an accessibility snapshot and screenshot under `artifacts/landing-page/` (`snapshot.aria.txt`, `home.png`). Both must show the product name.

## Gotchas

- Prefer the heading text over layout CSS, which may change.
