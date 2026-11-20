# Maintain verification run notes (scratch; do not treat as product docs)

Outcome target: changed (doc drift fixes) after live pass.

## Features covered

- stack-health: doctor ok; health.json
- landing-page: heading + Register/Log in links
- auth-register-login: register + me + logout 401
- task-cards: create + list
- calendar-reminders: 8 reviews, calendar days, due after forcing scheduledFor to now, complete → due 0

## Doc drift fixed

Landing Register links; auth Log out wording; SKILL auth stale; stack doctor scope; Create card label; schedule side effect pointer; due-today Complete precondition.

## Product gaps

None found this run. Complete UI path needs due-today arrangement (documented, proven via API after SQL bump of scheduledFor).
