---
description: React useEffect and session state patterns
globs: ["packages/website/**/*.tsx"]
---

## React Hooks Rules

**useEffect Dependencies:**

| Pattern | Rule |
|---------|------|
| Session-based redirects | Add `session === null` to condition |
| Router navigation | Check state exists before navigate |
| Async operations | Wrap in try/catch, handle loading state |

**Session Null Checks:**

```typescript
// WRONG
useEffect(() => {
  if (session.user.role === 'seller') navigate('/seller');
}, [session]);

// RIGHT
useEffect(() => {
  if (session && session.user.role === 'seller') navigate('/seller');
}, [session]);
```

**StateStore Usage:**

- Always check for null/undefined before access
- Use optional chaining for nested properties
- Set reasonable TTL (30min default for carts)
