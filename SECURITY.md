# Security

`eval-metrics-ts` is a small clean-room metrics package. It does not collect telemetry, call external services, or process data outside the local runtime that imports it.

## Reporting

Report security issues by email: [hello@pixelbrew.studio](mailto:hello@pixelbrew.studio).

Please include:

- the affected version or commit
- a minimal reproduction
- expected and actual behavior
- any practical impact you can demonstrate

There is no formal bug bounty program.

## Scope

In scope:

- incorrect package contents
- unsafe package behavior
- dependency or build-chain issues
- numerical behavior that creates a clear security or integrity risk in downstream use

Out of scope:

- expected metric limitations
- product-specific scoring policies in downstream applications
- requests involving private studio systems or other non-public infrastructure
