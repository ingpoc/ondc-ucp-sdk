---
description: API contract alignment between frontend and backend
globs: ["packages/website/**/*.ts", "packages/website/**/*.tsx"]
---

## API Contract Rules

**When creating API endpoints:**

| Frontend Param | Backend Param | Validation |
|----------------|---------------|------------|
| `q` | `query` | Accept both via alias |
| `text` | `query` | Accept both via alias |

**Type Safety:**

- All fetch responses must use typed wrapper: `fetchJson<T>(url)`
- Never use `response.json()` without type assertion
- API request/response types must be in shared `types/api.ts`

**Message Structure:**

- Agent SDK messages: `message.content[{type, text}]` (nested)
- Frontend components expect flat: `{ message, status, timestamp }`
- Transform at API boundary, not in components

**Endpoint Checklist:**

- [ ] Param names documented in JSDoc
- [ ] Type exported from shared
- [ ] Accept both legacy and new param names
- [ ] Response wrapper typed
