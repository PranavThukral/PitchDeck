# The Pitch Deck

A directory of competitions and opportunities for high school students in business, medicine and engineering. Students browse and filter listings, take a short quiz that ranks the best matches for them, save favourites, and ask a chatbot about deadlines and programs. Organizers submit listings, and an admin approves them.

The Pitch Deck is a team project. My work: the opportunity-matching quiz, the chatbot's retrieval and recommendations, the Google Sheets data layer and the opportunity pages, and the security and cleanup pass on this branch.

## Run it

Needs Node 20.9+ and pnpm 9.

```bash
cd frontend
pnpm install
cp .env.example .env.local   # fill in what you need; see below
pnpm dev                     # http://localhost:3000
pnpm test                    # unit tests (Vitest)
pnpm lint
pnpm build
```

Listings load from the public Google Sheet with no configuration. Accounts, favourites and likes need `MONGO_URI` and `AUTH_SECRET`; the chatbot needs `GROK_API_KEY`; admin login needs `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Every variable is described in [`frontend/.env.example`](frontend/.env.example).

## Architecture

One Next.js 16 (App Router) app in [`frontend/`](frontend): pages and API route handlers live together.

- **Listings** come from a Google Sheet with one tab per field and kind. [`lib/services/google-sheets.ts`](frontend/lib/services/google-sheets.ts) downloads each tab as CSV (cached for an hour), parses it, and derives status from the dates. Like counts are written back through the Sheets API.
- **Matching quiz** ([`lib/services/quiz-logic.ts`](frontend/lib/services/quiz-logic.ts)): branching questions, then a weighted score for every open listing. The top three with a positive score are shown.
- **Chatbot** ([`app/api/chatbot`](frontend/app/api/chatbot/route.ts)): requests that ask for recommendations are answered in code from the listings ([`chatbot-recommendations.ts`](frontend/lib/services/chatbot-recommendations.ts)). Everything else goes to xAI's Grok with the best-matching listings as context ([`chatbot-retrieval.ts`](frontend/lib/services/chatbot-retrieval.ts)). Rate-limited per client.
- **Accounts and submissions** live in MongoDB through Mongoose ([`lib/models`](frontend/lib/models)): students, organizers, favourites, likes and organizer-submitted listings waiting for approval.
- **Auth** ([`lib/auth`](frontend/lib/auth), [`lib/middleware/auth.ts`](frontend/lib/middleware/auth.ts)): bcrypt password hashes and a signed, httpOnly session cookie. Every API route that needs a user calls `verifyAuth`, which checks the token and reloads the user.

## Key design decisions

- **A spreadsheet as the CMS.** The team edits listings in Google Sheets, so new opportunities appear without a deploy; an hour-long cache keeps page loads from waiting on Google.
- **Rule-based matching, not ML.** With a few dozen listings and at most five questions per student, hand-tuned weights are explainable and testable: hard constraints such as budget and program type outweigh preferences such as team size.
- **Code before the model in the chatbot.** Recommendation questions get deterministic answers from the real listings; the model only handles open questions, and gets the relevant listings as context, which makes it far less likely to invent programs.
- **Stateless sessions.** The cookie holds a signed token with the user's id and type, never credentials; the user is reloaded on each request, so an unapproved account loses access at once.
- **Legacy passwords upgrade on login.** Accounts created before hashing are compared once in constant time, then rewritten as bcrypt hashes.

## Known limitations

- Session tokens can't be revoked before they expire (7 days). Changing a password doesn't log out other devices; rotating `AUTH_SECRET` logs out everyone.
- The admin is a single account from environment variables, with no roles or audit log.
- Login has no rate limiting or lockout.
- The chatbot's rate limiter is in memory, so it resets on each deploy and isn't shared across server instances.
- The business, medicine and engineering listing pages are near-duplicates of one another and should share a component.
- Tests cover auth, CORS and the matching algorithm; pages and the Sheets parser have none.
