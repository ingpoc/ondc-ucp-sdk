---
description: Test fixture requirements for Beckn/UCP protocols
globs: ["packages/**/*.test.ts", "packages/**/*.spec.ts"]
---

## Test Fixture Rules

**BecknContext Mandatory Fields:**

All test fixtures MUST include:

```typescript
{
  context: {
    country: "IND",
    city: "*",
    bap_id: "test.bap.com",
    bap_uri: "https://test.bap.com",
    // ... other fields
  }
}
```

**Timing-Based Tests:**

| Scenario | Bounds Formula |
|----------|----------------|
| 0-2000ms delay ± jitter | `expect(t).toBeGreaterThanOrEqual(0); expect(t).toBeLessThanOrEqual(4000)` |
| API timeout | `expected + (expected * 0.5)` |

**Array Access After Length Check:**

```typescript
// WRONG
expect(result.items).toHaveLength(1);
const first = result.items[0]; // TS error

// RIGHT
expect(result.items).toHaveLength(1);
const first = result.items[0]!; // non-null assertion
```

**Bash Scripts with Pipes:**

- Always start with `set -eo pipefail`
- Ensures exit codes propagate through pipes
