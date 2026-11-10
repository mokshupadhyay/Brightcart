# Brightcart

A tiny online store backend used as the demo product for [FlowBrief](https://devpost.com/) (Atlassian Codegeist 2026).
Its product docs live in Confluence ("Brightcart: Returns and Refunds Policy", "Support Runbook: Handling Return
Requests", "Customer FAQ: Returns"). When a PR here changes the returns flow, FlowBrief reads the PR and proposes
updates only to the doc sections it affects.

## Returns flow (today)

- A customer emails support to request a return within `RETURN_WINDOW_DAYS` of delivery.
- A support agent reviews the request and approves or declines it (`REQUIRE_AGENT_APPROVAL`).
- After approval the customer receives a prepaid return label by email.
- Refunds go to the original payment method after the warehouse inspects the item.
- Sale items are final sale.

```bash
npm test
```
