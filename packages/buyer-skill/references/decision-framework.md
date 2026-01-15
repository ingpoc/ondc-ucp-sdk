# Decision Framework

Making product selection decisions from candidate sets.

## Decision Process

1. **Gather Candidates**: Get top N results from search
2. **Score Candidates**: Apply scoring algorithm
3. **Compare Top K**: Detailed comparison of top 3-5
4. **Select Winner**: Choose based on highest score
5. **Explain Reasoning**: Provide clear rationale

## Selection Criteria

| Criterion | Weight | How Measured |
|-----------|--------|---------------|
| Price | User-defined | Lowest in set |
| Quality | User-defined | Rating score |
| Proximity | User-defined | Distance |
| Speed | User-defined | Delivery time |
| Trust | Fixed bonus | Verified status |

## Tie-Breaking

If scores are within 0.05:

1. Prefer verified sellers
2. Prefer higher rating
3. Prefer lower price
4. Random (document seed)

## Output Format

```json
{
  "selected": "item-id",
  "reasoning": "Best balance of price (INR X) and rating (Y)",
  "score": 0.82,
  "runner_up": "item-id-2",
  "tie_breaker_applied": false
}
```
