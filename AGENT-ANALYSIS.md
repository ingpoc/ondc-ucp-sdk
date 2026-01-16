# Agent Testing Workflow Analysis

## Session: TypeScript Type Fixing & App Testing (2026-01-16)

---

## Key Learnings

### 1. Type System Fragility

**Problem**: Frontend types (`@ondc-website/shared`) were incomplete shadows of backend types.

**Root Causes**:

- Types manually copied instead of imported from source of truth
- Divergence over time as features added
- Missing fields: `buyer`, `deliveryAddress`, `cancellation.cancelledBy`, `fulfillment.status`

**Impact**:

- 60+ TypeScript errors blocking dev servers from starting
- Unable to test any functionality until types fixed

### 2. Build Dependency Chain

**Discovery**: Type changes require rebuild cascade:

```
@ondc-website/shared → pnpm build → typecheck passes
```

**Time Cost**: ~2 minutes per iteration

### 3. Error Patterns

**Common Patterns Found**:

| Pattern | Count | Fix |
|---------|-------|-----|
| `price.value` undefined | 8 | `price.value ?? price.amount` |
| Missing optional chaining | 40+ | Add `?.` throughout |
| Type mismatches | 15 | Update type definitions |

---

## Optimized Workflow Recommendations

### Phase 1: Pre-Flight Checks (DO THIS FIRST)

```bash
# 1. Check context graph for similar issues
context_query_traces("UCPPrice type mismatch")

# 2. Verify build state
pnpm typecheck 2>&1 | grep -E "(error|Failed)"

# 3. If errors > 20, use batch fixes (see Phase 2)
# If errors < 20, fix manually
```

### Phase 2: Batch Fix Strategy

**For repetitive errors (>10 instances)**:

1. **Create fix script** instead of manual edits:

```bash
# Fix UCPPrice fallback pattern
find packages/website -name "*.tsx" -exec sed -i '' \
  's/price\.value/price.value ?? price.amount/g' {} +
```

1. **Update type definitions** in single file, not scattered:

```typescript
// packages/shared/src/types/ucp/order.ts - SOURCE OF TRUTH
// Re-export from here, don't copy-paste
```

### Phase 3: Verification

```bash
# 1. Rebuild affected packages
cd packages/website/shared && pnpm build

# 2. Full typecheck
pnpm typecheck

# 3. Start servers ONLY after typecheck passes
pnpm dev
```

### Phase 4: Browser Testing

**Sequence**:

1. Test **Buyer App** → localhost:3000
   - Search functionality
   - Product details
   - Cart management
   - Checkout flow
   - Order tracking

2. Test **Seller App** → localhost:3002
   - Catalog management
   - Order receiving
   - Order fulfillment
   - Configuration

3. Test **Integration**
   - Buyer places order → Seller receives
   - Seller updates status → Buyer sees changes
   - Cancellation flow

---

## Time Optimization

| Current | Optimized | Savings |
|---------|-----------|---------|
| Manual fix 60+ errors (45 min) | Batch script (2 min) | 43 min |
| Trial-and-error rebuild | Single rebuild cascade | 10 min |
| No context graph check | Check first | 15 min+ |

**Total session time**: ~2 hours
**Optimized time**: ~30 minutes

---

## Rules for Future Agents

### 1. ALWAYS Check Context Graph First

```typescript
// Before making changes:
context_query_traces("keyword from error")
context_get_trace(trace_id) // Read full context
```

### 2. Type Hierarchy Rule

```
Source of Truth: packages/shared/src/types/
↓
Re-export in packages/website/shared/src/types/
↓
Import in components: @ondc-website/shared
```

### 3. When Error Count > 20

- STOP manual editing
- CREATE fix script
- RUN on all files
- VERIFY with typecheck

### 4. Rebuild Command Sequence

```bash
# After type changes:
cd packages/website/shared && pnpm build && cd ../.. && pnpm typecheck
```

### 5. Browser Testing Protocol

- Start servers ONLY after clean typecheck
- Test ONE app completely before next
- Document issues as you find them
- Fix BEFORE recording to context graph

---

## Context Graph Entry Template

**AFTER issue is fixed and tested**, store with:

```typescript
context_store_trace({
  decision: "Fixed UCPPrice optional property access pattern across buyer/seller apps",
  category: "error",
  outcome: "success",
  feature: "SDK-BUYER-ORDERS-003"
})
```

**Key**: Only store SUCCESSFUL fixes with working solutions.

---

## Tools That Helped

| Tool | Use Case | Time Saved |
|------|----------|------------|
| `context_query_traces` | Find similar past issues | 15+ min |
| `grep -E "error\|Failed"` | Quick error count | 2 min |
| `sed` batch replace | Repetitive fixes | 40+ min |
| `pnpm build` | Update types | Required |

---

## What Didn't Work

❌ Manual editing of 60+ similar errors
❌ Fixing without understanding type hierarchy
❌ Not checking context graph first
❌ Starting dev servers before typecheck passes

---

## Next Session Checklist

- [ ] Query context graph for error patterns
- [ ] Count errors: `pnpm typecheck 2>&1 | grep -c error`
- [ ] If >20: create batch fix script
- [ ] Rebuild shared package
- [ ] Verify clean typecheck
- [ ] Start servers
- [ ] Browser test systematically
- [ ] Store ONLY working fixes to context graph
