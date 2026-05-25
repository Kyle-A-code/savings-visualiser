# Architecture and Scope Decisions

This is my log of intentional trade-offs for this project.

Project context:

- This project is one-and-done after v1 and designed as a personal tool for myself,
- I do not plan to
  - add features,
  - add collaborators,
  - run this outside of local/LAN access
- The project has been a learning exercise

## 1) No auth

### Decision

I am not implementing authentication/authorization.

### Trade-off I accept

- This API is not intended for public internet exposure in its current form.

### When I would implement this

- I would only implement this if the scope changed to public deployment or multi-user access.
- Under the current plan, that change is not expected.

---

## 2) No CI pipeline

### Decision

I am not adding a CI pipeline.

### Trade-off I accept

- There is no automated gate on every change (`lint`/`typecheck`/`test`/`build`).
- Validation is manual/local only.

### When I would implement this

- I would only implement this if the project moved from one-and-done to actively maintained.
- Under the current plan, that change is not expected.

---

## 3) Single use case for transfer

### Decision

Transfer between buckets is a cross-aggregate workflow: it reads buckets, writes transactions, and must run atomically. It did not fit cleanly in a handler or a repository.

- A **transaction handler** would need bucket access (look up titles, confirm buckets exist). That either leaks `BucketRepository` into one transaction route or reaches through the transaction repo into bucket internals. Moving it to **bucket routes** has the same problem in reverse — a bucket endpoint whose job is to create transactions.
- A **repository** method would mix transaction persistence with orchestration across buckets.

For v1, that logic lives in `TransferUsecase` only. The handler calls `Execute` and maps errors to status codes. The route stays `POST /transactions/transfer`; the use case owns the bucket + transaction coordination internally. All other endpoints use repositories directly.

This is not a general service layer — one use case for one workflow whose ownership was otherwise unclear.

### Trade-off I accept

- There is a single route that injects a usecase as opposed to all other routes having the repository injected. While minor it is still an inconsistency
- Separation between data access and application orchestration is weaker than I would use in a larger system.

### When I would implement a full service layer

- I would introduce a proper application/service layer if I reopened active development and more cross-aggregate workflows appeared (e.g. bulk transfers, scheduled moves, multi-step flows).
- Under the current plan, that change is not expected.

---

## Review cadence for these decisions

These decisions are intentionally stable for this one-and-done v1.
I would only revisit this document if I explicitly changed project scope.
