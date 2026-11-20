# Auth register and login

Auth lets a learner register with email and matching passwords, log in, reach an authenticated dashboard, and log out.

## Sub-features

- `auth-register` creates an account when password and confirm password match.
- `auth-login` signs in with email and password.
- `auth-me` returns the public user while cookies are valid.
- `auth-logout` clears the session.
- `auth-dashboard` shows the authenticated workspace shell.

## How to get to it (user POV)

- Open `/register`, submit email, password, confirm password.
- Open `/login`, submit email and password.
- Land on `/dashboard` when authenticated.
- Choose **Log out** on the dashboard.

## Driving it with Cursor IDE browser and curl

Preconditions:

- `helpers/doctor.sh` exits `0`.
- Routes `/register`, `/login`, and `/dashboard` exist on the web app.
- API exposes `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` with HttpOnly JWT cookies.

- **Register.** Open `/register`, fill Email, Password, Confirm Password with a unique lowercase email. Choose **Create account**. Browser reaches `/dashboard` and shows the email.
- **API me.** With the cookie jar from register, run `curl -sf -b cookies.txt http://localhost:4000/auth/me`. Body includes the same email.
- **Logout then login.** Log out, open `/login`, sign in with the same credentials. Dashboard shows the email again.
- **Proof.** Save dashboard screenshot and `me.json` under `artifacts/auth-register-login/`.

## Gotchas

- Web routes `/register`, `/login`, and `/dashboard` call the API at `NEXT_PUBLIC_API_URL` with `credentials: "include"`. The browser talks to the API origin directly; CORS must allow `http://localhost:3000`.
- Unauthenticated `/dashboard` redirects to `/login` after `GET /auth/me` returns 401.
- Emails are normalized to lowercase. Assert the normalized address.
- Cookies are HttpOnly. Drive auth through the browser or curl cookie jars, not `localStorage`.
