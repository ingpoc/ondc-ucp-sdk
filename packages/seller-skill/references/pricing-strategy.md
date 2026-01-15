# Pricing Strategy

Dynamic pricing recommendations for competitive advantage.

## Analysis Process

1. **Fetch Competitors**: Get top 10 results for category
2. **Calculate Metrics**: Average price, min, max, standard deviation
3. **Determine Position**: Current rank vs target
4. **Recommend Price**: Optimal price point

## Price Recommendations

| Scenario | Recommendation | Reasoning |
|----------|---------------|-----------|
| New product, no competition | Market rate | Test demand elasticity |
| Price > avg + 2σ | Reduce to avg + σ | Overpriced, low visibility |
| Price < avg - 2σ | Increase to avg - σ | Undercutting unnecessarily |
| Middle pack | Reduce 5% | Gain ranking without margin loss |

## Formulas

**Optimal Price:**

```typescript
const avg = mean(competitor_prices);
const std = stddev(competitor_prices);
const optimal = avg - (std * 0.5);  // Slightly below average
```

**Break-Even Analysis:**

```
margin_price = cost / (1 - desired_margin)
competitive_price = min(optimal_price, margin_price)
```

## Dynamic Pricing Factors

| Factor | Weight | Notes |
|--------|--------|-------|
| Competitor pricing | 40% | Primary driver |
| Demand elasticity | 30% | Category-dependent |
| Seasonality | 20% | Time of year |
| Inventory level | 10% | Clearance pricing |
