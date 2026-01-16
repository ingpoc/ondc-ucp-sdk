---
description: Browser testing verification patterns for webapp features
globs: ["packages/website/**/*.tsx", "packages/website/**/*.ts"]
---

## Browser Testing Rules

**Feature Verification:**

| Verification Type | Mock/Unit | Browser |
|-------------------|-----------|---------|
| API contracts | ✅ Acceptable | ✅ Required |
| UI integration | ❌ Insufficient | ✅ Required |
| User workflows | ❌ Insufficient | ✅ Required |
| feature-list.json status | ⚠️ May differ | ✅ Ground truth |

**Verification Gaps:**

```typescript
// WRONG
// feature-list.json says "implemented" - no browser test run
// Unit tests pass - assumes feature works

// RIGHT
// Run browser testing skill to verify actual functionality
// feature-list.json status != browser-visible features
```

**When to Use Browser Testing:**

| Scenario | Action |
|----------|--------|
| After feature implementation | Load browser-testing skill |
| feature-list.json shows "implemented" | Verify in browser |
| API contract changes | Test actual network requests |
| UI component changes | Verify DOM/rendering |

**Browser Testing Priority:**

1. API endpoints → curl/validate-api-contracts.sh
2. UI features → browser-testing skill
3. End-to-end workflows → browser-testing skill

**Don't rely on:**

- Mock-only verification for UI features
- feature-list.json status as proof of functionality
- Unit tests for integration verification
