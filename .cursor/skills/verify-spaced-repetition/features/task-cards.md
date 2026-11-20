# Task Cards

Task Cards let a signed-in learner create, list, view, and edit notes. Descriptions are TipTap JSON documents, not HTML strings.

## Sub-features

- `task-cards-list` shows the current user's cards with title and last updated time.
- `task-cards-create` creates a card with a title and TipTap rich-text description.
- `task-cards-view` shows one card with a read-only TipTap render (no raw HTML injection).
- `task-cards-edit` updates title and description, then returns to the view page.
- `task-cards-dashboard-link` reaches `/cards` from the authenticated dashboard.

## How to get to it (user POV)

- Sign in, open Dashboard, choose Task Cards.
- From `/cards`, choose New card, enter a title, format the description, submit.
- Open a card from the list to view it. Choose Edit to change title or body, then Save.

## Driving it with Cursor IDE browser

Preconditions:

- `helpers/doctor.sh` exits `0`.
- Auth routes work (see [auth-register-login.md](./auth-register-login.md)).
- API exposes `POST/GET /task-cards` and `GET/PATCH /task-cards/:id` with session cookies.

- **Register or log in.** Reach `/dashboard`.
- **Open Task Cards.** Choose the Task Cards control. Browser reaches `/cards`.
- **Create.** Open New card. Fill Title. Use Bold or Bullet list in the editor. Submit. Browser lands on `/cards/[id]` and shows the title and formatted body.
- **List.** Open All cards. The new title appears with an Updated timestamp.
- **Edit.** Open Edit, change the title and body, Save. View page shows the updates.
- **Proof.** Save screenshots and an accessibility snapshot under `artifacts/task-cards/`.

## Gotchas

- Description must be TipTap JSON `{ "type": "doc", ... }`. Never persist HTML strings from the editor.
- Read-only view uses TipTap with `editable={false}` and the same StarterKit schema. Do not inject `dangerouslySetInnerHTML` from untrusted HTML.
- Unauthenticated `/cards` routes redirect to `/login` after `GET /auth/me` returns 401, same as the dashboard.
- Web calls the API at `NEXT_PUBLIC_API_URL` with `credentials: "include"`. Drive mutations through the browser (or curl with a cookie jar), not `localStorage`.
