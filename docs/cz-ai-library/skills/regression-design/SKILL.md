---
id: regression-design
version: 1.0.0
roles: [testing-qa, frontend-ux, backend-apis]
triggers: [bug fix, regression, CI, reproduction]
---
# Regression-first QA

1. Reproduce the issue using current code and record expected versus actual behavior.
2. Write the smallest test that fails before the fix for the correct reason; do not engineer only a passing mock.
3. Include negative/edge paths, source-integration and old-behavior preservation where relevant.
4. Run tests in a deterministic, credential-free CI job; Kimi profiles without Bash must not claim local execution.
5. Inspect real changed code and coverage gaps. Separate structural evidence, browser emulation, real device and production validation.
6. Associate the regression test and fixed commit with a lesson candidate only after independent review.
