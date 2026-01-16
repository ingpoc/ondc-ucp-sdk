---
description: Problematic ESM imports and workarounds
globs: ["packages/website/**/*.ts", "packages/**/vitest.config.ts"]
---

## ESM Import Rules

**Blocked Direct Imports:**

| Package | Issue | Workaround |
|---------|-------|------------|
| `libsodium-wrappers` | ESM binding error | Use `@mock` in vitest, comment in source |
| `@ondc/seller-sdk` | Depends on libsodium | Import via api-server only |

**pnpm Workspace:**

- Never assume symlinks work correctly
- Use `pnpm why <package>` to check resolution
- After adding dep: run `pnpm install` twice

**Vitest Aliases:**

```typescript
// vitest.config.ts
resolve: {
  alias: {
    'libsodium-wrappers': '@mock/libsodium'
  }
}
```

**After Dependency Changes:**

1. Delete `node_modules`, `pnpm-lock.yaml`
2. Run `pnpm install` twice
3. Check `pnpm why <package>`
