# Scoring Algorithm

Preference-based scoring for UCP items.

## Scoring Formula

```
score = (price_score × price_weight)
      + (distance_score × distance_weight)
      + (rating_score × rating_weight)
      + (delivery_score × delivery_weight)
      + (verified_bonus if verified)
```

### Component Scores

| Component | Formula | Range |
|-----------|---------|-------|
| price_score | 1 - (price - min) / (max - min) | 0-1 |
| distance_score | 1 - (dist - min) / (max - min) | 0-1 |
| rating_score | rating / 5 | 0-1 |
| delivery_score | 1 - (time - min) / (max - min) | 0-1 |
| verified_bonus | +0.1 if verified | +0.1 |

### Normalization

All weights normalized to sum to 1.0:

```typescript
const sum = priceWeight + distanceWeight + ratingWeight + deliveryWeight;
priceWeight /= sum;
distanceWeight /= sum;
// etc...
```

## Example

Item: INR 150, 4.5★ rating, verified
Preferences: priceWeight: 0.4, ratingWeight: 0.6
Context: minPrice: 100, maxPrice: 200

```
price_score = 1 - (150-100)/(200-100) = 0.5
rating_score = 4.5/5 = 0.9
verified_bonus = +0.1

score = 0.5 × 0.4 + 0.9 × 0.6 + 0.1 = 0.75
```
