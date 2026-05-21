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

## 3) Keep orchestration logic in repositories

### Decision

I am keeping selected orchestration logic in repository methods instead of adding a dedicated usecase/service layer.
For this project, that mainly means transfer logic and goal-completion checks after transaction writes.

### Trade-off I accept

- Some repository methods mix persistence and workflow logic.
- Separation between data access and application orchestration is weaker than I would use in a larger system.

### When I would implement this

- I would only split this into usecases if I reopened active development and the workflow complexity actually grew.
- Under the current plan, that change is not expected.

---

## Review cadence for these decisions

These decisions are intentionally stable for this one-and-done v1.
I would only revisit this document if I explicitly changed project scope.
