# Contributing to AstraView TradePulse Pro

Thank you for your interest in contributing to **AstraView TradePulse Pro**!

## Guidelines & Development Workflow

1. **Code Quality & Types**:
   - Write clean, fully-typed TypeScript code without using `any`.
   - Ensure all components pass `npx tsc --noEmit`.

2. **Testing**:
   - Add corresponding unit tests under the `test/` directory using `node:test` and `node:assert/strict`.
   - Ensure all tests pass with `npm test`.

3. **Performance & Real-Time Data**:
   - Avoid un-memoized heavy calculations in React render paths.
   - External REST API calls must use caching or throttled intervals (e.g. 10s TTL) to prevent rate limits.

4. **Pull Request Process**:
   - Create a feature branch.
   - Run `npm test` and `npx tsc --noEmit` before submitting PR.
