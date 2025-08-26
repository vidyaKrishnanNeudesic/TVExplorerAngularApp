# copilot-instructions.md

> Opinionated guidance for GitHub Copilot / GitHub Agents when working in this repository.  
> **Stack:** Angular **v20**, TypeScript (strict), RxJS, Standalone Components, Signals, SSR/Hydration, Jest + Testing Library, Cypress, ESLint/Prettier.  
> **Goals:** correctness, performance, accessibility (WCAG 2.2 AA), security, testability, maintainability.

---

## 0) What to optimize for

1. **Correctness, typing, and simplicity** over cleverness.  
2. Prefer **Standalone APIs**, **Signals**, and the **new template control flow** (`@if`, `@for`, `@switch`).  
3. **Performance:** lazy routes, defer blocks, trackBy, memoized signals, pure pipes, avoid template-side heavy logic.  
4. **Security & a11y** baked in: sanitized HTML, ARIA, keyboard nav, contrast, focus states.  
5. **Observability:** explicit error mapping, structured logging, and UX telemetry events.  

---

## 1) Repo layout & naming

```
/apps/<app-name>/                      # App entrypoints (SSR + CSR bootstraps)
/libs/core/                            # Cross-cutting: config, auth, http, logger, analytics, feature-flags
/libs/shared/                          # UI kit: presentational components, directives, pipes, utilities
/libs/features/<domain>/               # Vertical slices (feature, data-access, state, ui)
/tools/                                # Scripts, schematics, codegen, CI helpers
/requirements/                         # EARS requirements documents per feature
```

**Naming:** files `kebab-case`, types `PascalCase`, members `camelCase`. One public symbol per file. Prefer `index.ts` barrels in `ui/` only if they don’t cause circular deps.

**Feature library structure (DDD-lite):**
```
libs/features/<domain>/
  feature/          # routed shell(s) - smart components
  ui/               # presentational standalone components (dumb)
  data-access/      # typed HTTP clients, DTOs, mappers, interceptors
  state/            # ComponentStore or Signals-based stores
```

---

## 2) Angular application setup (authoritative)

```ts
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    // i18n providers, feature flags, APP_INITIALIZER for runtime config, etc.
  ]
});
```

**Rules**
- New code uses **standalone components** only (no NgModules).  
- Use `inject()` for DI when not required in constructor (testability + terseness).  
- Prefer **Signals** for view state; convert Observables at boundaries with `toSignal()`.  
- Template control flow uses `@if/@for` with stable `track` expressions.  
- No direct DOM manipulation: use CDK/Renderer2; SSR-safe code by default.  

---

## 3) Routing, SSR & hydration

- Configure with `provideRouter(...)` and lazy `loadComponent`/`loadChildren`.  
- SSR (Angular Universal) + hydration **must** be enabled. Avoid side effects in constructors.  
- Use **defer blocks** for below-the-fold content and **route-level code splitting**.  
- Preload critical routes with a custom strategy when it improves UX.

---

## 4) HTTP, data modeling & error policy

- Centralize HTTP with `provideHttpClient(withInterceptors([...]))`.  
- Each domain has a **typed client** in `data-access/`.  
- **Never** bind raw DTOs to templates. Map DTO → **Domain model** via pure mappers.  
- Interceptors: `auth`, `error` (HTTP → domain errors), `retry` (idempotent GETs), `logging` (sanitized; dev).

**Domain error taxonomy** (example): `AuthError`, `NetworkError`, `NotFoundError`, `ServerError`, `UserInputError`.  
Display user-friendly messages and actionable recovery (retry/back).

---

## 5) State management

- Prefer **Signals** for local UI state.  
- For async orchestration / cross-component state, use **ComponentStore** or Signals Store pattern.  
- Effects use RxJS (`switchMap`, `exhaustMap`, `takeUntilDestroyed()`), never nested `subscribe`.  
- Derive computed state via `computed(...)` and keep mutations in one place.

---

## 6) UI kit, accessibility & theming

- Presentational components go in `/shared/ui`; inputs/outputs are **explicit** and typed.  
- Theming: light/dark + reduced motion; CSS custom properties for tokens.  
- A11y: proper roles/ARIA, focus traps where appropriate, visible focus rings, keyboard navigation.  
- Prefer CDK primitives (overlay, portal, a11y) over heavyweight UI libs.

---

## 7) Forms

- Default to **Reactive Forms with typed controls**; for simple view state, use signals.  
- Validators are pure; error messages localized; announce errors to screen readers.  
- Avoid template-driven forms unless legacy interop.

---

## 8) i18n & localization

- Use Angular built-in i18n. Extract in CI.  
- All user-facing strings go through i18n; format dates/numbers with locale-aware pipes.

---

## 9) Testing strategy

- **Unit**: Jest + Testing Library (components, stores, mappers, interceptors).  
- **Component**: test **behavior** and a11y states; avoid internal implementation details.  
- **E2E**: Cypress with axe-core for a11y smoke.  
- **Contract** (optional): mock server or Pact where APIs are owned.  
- Each PR must run unit + component tests; E2E: smoke on PRs, full on `main` nightly.

---

## 10) Tooling, linting, formatting, commits

- ESLint (strict) + Prettier. No disabling rules without justification.  
- Git hooks: `husky` + `lint-staged`.  
- Conventional commits with `commitlint` → auto `CHANGELOG`.  
- Enforce `tsc --noEmit`, `ng build --configuration production` in CI gates.

---

## 11) Performance checklist (PR reviewer aid)

- Stable `track` in `@for`.  
- Avoid functions/closures computed in templates.  
- Computation-heavy logic memoized (signals/computed).  
- Image optimization: `ngOptimizedImage`, responsive sources, compression.  
- Bundle budgets enforced; analyze with `source-map-explorer` in CI.

---

## 12) Security & privacy

- Sanitize untrusted HTML (`DomSanitizer` when absolutely necessary + review).  
- Use **HttpOnly cookies** for tokens where possible; if not, keep tokens in memory, not localStorage.  
- Adopt CSP, SRI, and Trusted Types where the platform allows.  
- No PII in logs/telemetry.  
- Route guards are for UX only; **authorization is server-side**.

---

## 13) Runtime configuration

- Load `/assets/app.config.json` at startup via `APP_INITIALIZER`.  
- No environment secrets committed. Use runtime/env injection per environment.

---

## 14) Logging, analytics, and feature flags

- Provide a `Logger` abstraction with levels (debug/info/warn/error).  
- Emit **structured logs** (JSON) and UX telemetry events with documented schemas.  
- Feature flags behind an injectable provider; default to safe behavior if source missing.

---

## 15) Copilot / GitHub Agent prompt recipes

Use these verbatim in **Copilot Chat** (workspace) or as PR instructions.

### a) New presentational component
> Create a **standalone** presentational component in `libs/shared/ui/<name>`.  
> Inputs/Outputs are typed and minimal. Use **signals** for derived view state only.  
> No data fetching. Include Jest + Testing Library spec (a11y assertions).

### b) Feature route shell
> Generate a routed **standalone** feature shell in `libs/features/<domain>/feature/<name>`.  
> Compose `shared/ui` components, orchestrate a **store**, and implement loading/empty/error states.  
> Add lazy route with `loadComponent`. Provide i18n and basic a11y.

### c) Data-access client + mapper
> In `libs/features/<domain>/data-access`, create a typed `HttpClient` service, DTOs, and mappers.  
> Map API DTO → domain model with pure functions and unit tests for edge cases.  
> Use interceptors for auth/error mapping.

### d) Error interceptor
> Implement `errorInterceptor` that maps HTTP errors → domain errors.  
> Tests for 0/401/403/404/5xx branches with typed assertions.

### e) Store pattern
> Create a `ComponentStore` (or Signals Store) managing `<domain>` state with effects that call the client.  
> Tests cover success, empty, and error states with marble or fakeAsync timers.

---

## 16) POC-specific guidance (TV Show Explorer)

Align implementations to these feature slices (endpoints refer to the TV Maze API).

- **Show Search & Listing**: `GET /search/shows?q=QUERY` → map to domain `{ id, title, score?, genres[] }`.  
- **Show Detail View**: `GET /shows/:id` (+ `GET /shows/:id/cast`, `GET /shows/:id/episodes`).  
- **Episodes by Season**: group `GET /shows/:id/episodes` by season; accessible accordion or tabs.  
- **Cast & Crew**: render actor + character; fallback images; keyboard and screen reader friendly.  
- **Local User Reviews**: local store + optional localStorage persistence; validate text (≤500) and optional rating 1–5.  
- **Responsive & A11y**: mobile-first grid, navigation, and axe-core checks in E2E.

*(These are provided as agent-friendly anchors; see `/requirements/*.md` for EARS documents.)*

---

## 17) CI gates (recommended)

1. Type-check + ESLint + Prettier check  
2. Unit + component tests  
3. Build SSR + client (production)  
4. Cypress smoke (PR) / full suite (main)  
5. Bundle analysis + Lighthouse budgets (non-blocking report on PR, fail on main if regressed)

---

## 18) Quick reference snippets

**Signals-based presentational component**
```ts
@Component({
  standalone: true,
  selector: 'ui-rating',
  template: `
    <div role="img" aria-label="{{ ariaLabel() }}">
      @for (i of stars(); track i) { ★ }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent {
  readonly max = input<number>(5);
  readonly value = input.required<number>();
  readonly stars = computed(() => Array.from({ length: this.value() }));
  readonly ariaLabel = computed(() => `Rating ${this.value()} of ${this.max()}`);
}
```

**HTTP client + mapper**
```ts
export interface ShowDto { id: number; name: string; rating?: { average?: number }; genres: string[]; }
export interface Show { id: number; title: string; score?: number; genres: readonly string[]; }
export const mapShow = (dto: ShowDto): Show => ({
  id: dto.id,
  title: dto.name,
  score: dto.rating?.average ?? undefined,
  genres: dto.genres
});
```

**ComponentStore effect**
```ts
readonly loadShows = this.effect((query$: Observable<string>) =>
  query$.pipe(
    tap(() => this.patchState({ loading: true })),
    switchMap(q => this.api.searchShows(q).pipe(
      tapResponse(
        shows => this.patchState({ shows, loading: false, error: null }),
        err => this.patchState({ error: mapError(err), loading: false })
      )
    ))
  )
);
```

---

## 19) Definition of Done (enterprise)

- All acceptance criteria satisfied (see `/requirements/*.md`).  
- 100% type coverage on public APIs; tests for critical paths.  
- No high-severity lint or a11y issues.  
- Bundle sizes within budget; no hydration or SSR warnings.  
- Telemetry events present for key user journeys.  
- Docs updated (README, requirements, and this file if patterns change).
