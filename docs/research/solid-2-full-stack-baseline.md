# Solid 2 full-stack baseline

Research date: 2026-08-25

Ticket: [#9, Establish the Solid 2 full-stack baseline](https://github.com/better-salmon/shopping-list/issues/9)

## Scope

This note records the mechanisms and constraints that current primary sources and the repository's exact dependencies expose for routing, server functions, rendering, hydration, deployment, service workers, and testing. It does not select an application architecture.

## Repository baseline

The repository pins `solid-js` and `@solidjs/web` to `2.0.0-rc.1`, `@solidjs/vite-plugin` to `3.0.0-next.32`, Vite to `8.2.2`, Vitest and its Playwright browser provider to `4.1.11`, and Playwright to `1.62.1`. It requires Node `^26.7.0` and pnpm `11.23.0` ([package.json](../../package.json)). The plugin's pinned release requires Vite 8 or newer, so the repository meets that package-level constraint ([`3.0.0-next.32` release](https://github.com/solidjs/solid-vite-plugin/releases/tag/%40solidjs%2Fvite-plugin%403.0.0-next.32)).

Solid 2 is an RC: the public API is frozen, but the maintainers still expect bugs before stable. The same announcement replaces a future SolidStart v3 with start mode in the Vite plugin ([Solid 2 RC announcement](https://github.com/solidjs/solid/discussions/2995)). The exact plugin is still a prerelease. Its README labels client start mode and server-function compilation experimental even though they are part of the Solid 2 release track ([pinned plugin README](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsstart), [server-functions option](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsserverfunctions)). Architecture and upgrade work must preserve this distinction between a frozen framework API and prerelease integration code.

The current configuration only enables `solid({ start: true })`; it does not enable `ssr`, `serverFunctions`, middleware, or a deployment integration ([vite.config.ts](../../vite.config.ts)). A verified `pnpm build` first built an internal client and server environment, prerendered the document shell, removed the temporary server bundle, and left only `dist/client`, including `index.html`, the Vite manifest, and static assets. This matches the pinned plugin's documented client-mode build lifecycle: the final artifact is static unless server functions are enabled ([client-mode contract](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsstart)).

No routing package, filesystem-routing package, deployment adapter, service-worker package, or browser persistence package is installed ([package.json](../../package.json)). The application is still a client-rendered counter, so no current code exercises a full-stack or offline boundary ([src/app.tsx](../../src/app.tsx)).

## Routing

Routing is an application integration, not a requirement of the Solid runtime. Start mode does not prescribe a router, route-definition style, or file naming convention ([routing overview](https://v2.solidjs.com/routing/overview)).

The first-party Solid Router 2 path uses a `createRouter` instance created at module scope and mounted from the application. Routes can be defined in code, and `filesystem-routing` can generate a router-neutral manifest that an adapter converts for Solid Router ([router setup](https://v2.solidjs.com/routing/solid-router/setup), [route definitions](https://v2.solidjs.com/routing/solid-router/route-definitions), [`filesystem-routing` repository](https://github.com/solidjs/filesystem-routing)). The filesystem package, not core Solid, owns file scanning and HTTP-method route conventions. Other routers can use their own generators or adapters ([routing overview](https://v2.solidjs.com/routing/overview)).

For SSR, the server and client must use the same router configuration. Lazy route subtrees need streaming rather than synchronous string rendering. Solid Router queries can serialize keyed server results into the hydration registry so the client adopts them without repeating the initial request ([router server rendering](https://v2.solidjs.com/routing/solid-router/server-rendering)).

Therefore, the later architecture ticket must choose and pin a router, choose code-defined or generated routes, and decide whether HTTP API routes share that route convention. None of these choices is already made by the repository.

## Server functions and request handling

Server functions are opt-in through `serverFunctions: true` or its object form. The default transport endpoint is `/_server`. A function-level or module-level `"use server"` directive extracts functions into the server build; a function cannot close over component-local state, so call data must be passed as arguments ([server-functions guide](https://v2.solidjs.com/building-apps/server-functions), [pinned plugin option](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsserverfunctions)).

The client representation is fetch-backed, while an SSR call can execute in process. TypeScript types do not validate the HTTP boundary: every argument and authorization decision still needs runtime validation. POST is the default; the `GET` wrapper is only for safe, idempotent reads, and its arguments can appear in URLs, browser history, logs, and caches ([server-functions guide](https://v2.solidjs.com/building-apps/server-functions)).

The request event supplies the web `Request`, request-local data, and response metadata across middleware and server functions. Core server functions are a transport primitive. Solid Router's optional `query` and `action` layers add keyed caching, submissions, form enhancement, and revalidation, but these are router facilities rather than an automatic data model ([server-functions guide](https://v2.solidjs.com/building-apps/server-functions)).

Start middleware uses the Fetch contract `(Request, next) => Response` and surrounds pages, server functions, and other handled requests. File-based API discovery and HTTP method conventions belong to the filesystem-routing integration rather than to this middleware contract ([middleware and API routes](https://v2.solidjs.com/building-apps/middleware-and-api-routes)).

## Rendering and hydration

Current client mode prerenders only a document shell and then performs a fresh client render. It uses non-hydratable client transforms; there is no existing application DOM for `hydrate` to claim ([pinned client-mode contract](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsstart)).

Adding `ssr: true` selects streaming SSR start mode. The production build then retains `dist/client` and `dist/server/server.js`; the client hydrates the server-rendered tree ([deployment guide](https://v2.solidjs.com/building-apps/deployment), [pinned SSR contract](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md#optionsstart)).

Hydration only applies to HTML produced by Solid's string or stream renderers. The initial server and client structure must match, `HydrationScript` must appear once before the application, and separate roots require matching distinct render IDs. `renderToStream` can flush a shell and later boundary fragments; asynchronous work outside a loading boundary delays the shell ([rendering and SSR](https://v2.solidjs.com/concepts/rendering-and-ssr)).

An SSR-capable application must be server-safe and deterministic for its first render. Browser APIs must be isolated behind client lifecycle code, `isServer`, or `clientOnly` as appropriate ([project shapes](https://v2.solidjs.com/getting-started/project-shapes), [rendering and SSR](https://v2.solidjs.com/concepts/rendering-and-ssr)). The architecture ticket must decide whether SSR provides enough value to accept this constraint; Solid does not require SSR for full-stack server functions.

## Deployment contract

With `ssr: true`, the built server entry exports `handleRequest(Request)` and a default Fetchable `{ fetch(request) }`. A host must serve `dist/client` before passing unmatched requests to the handler, preserve the request method, headers, URL, and non-GET body, and preserve response status, headers, separate `Set-Cookie` values, and streamed body ([deployment guide](https://v2.solidjs.com/building-apps/deployment)).

The official full-stack template includes a verified Node adapter. Officially documented provider integrations compose platform Vite plugins with the normal Solid `ssr` environment: Netlify emits a streaming function, Nitro v3 adopts the Fetchable handler, and Cloudflare's Vite plugin runs and builds that environment for Workers. Other Fetch runtimes can consume the server module if static assets, runtime dependencies, and environment values are configured correctly ([deployment guide](https://v2.solidjs.com/building-apps/deployment), [official full-stack template](https://github.com/solidjs/templates/tree/daae7c0a2c3caae7b24a6e21bd068d93aa4ffdae/solid-v2/fullstack)).

Client mode without server functions can deploy only `dist/client`. Client mode with server functions still serves pages statically but must deploy both the static directory and the server endpoint. `vite preview` verifies the combined built handler and assets but does not prove compatibility with the target host ([deployment guide](https://v2.solidjs.com/building-apps/deployment)).

## Service workers and offline operation

The reviewed Solid 2 documentation, the pinned Vite plugin, and the official Solid 2 templates expose no Solid-specific service-worker or PWA API. Service-worker integration is therefore a separate web-platform and Vite concern, not a start-mode capability ([pinned plugin README](https://github.com/solidjs/solid-vite-plugin/blob/7d21e27fd5e87cf5e3c72993935c9f6b48c3eb78/README.md), [official Solid 2 templates](https://github.com/solidjs/templates/tree/daae7c0a2c3caae7b24a6e21bd068d93aa4ffdae/solid-v2)).

A service worker is registered for a URL scope, can intercept fetch events and answer with `Response` objects, and can manage named request/response caches. Registration and clients require secure contexts, normally HTTPS, with local development exceptions. Cache entries do not expire or update automatically when the worker changes, so cache versioning and cleanup are application responsibilities ([Service Worker specification](https://w3c.github.io/ServiceWorker/#service-worker-container-register), [fetch event](https://w3c.github.io/ServiceWorker/#fetch-event), [cache lifetime](https://w3c.github.io/ServiceWorker/#cache-lifetimes), [security](https://w3c.github.io/ServiceWorker/#security-considerations)).

Vite can copy an authored worker unchanged from `public` to the build root, or the application can add a general Vite plugin. That proves an integration seam, not compatibility with Solid's multi-environment builds ([Vite static assets](https://vite.dev/guide/assets#the-public-directory), [Vite plugin API](https://vite.dev/guide/api-plugin)). Registration code in an SSR-capable application is browser-only and must follow Solid's server-safety rules ([rendering and SSR](https://v2.solidjs.com/concepts/rendering-and-ssr)).

Inference: a cached application shell can start offline, but a fetch-backed server function cannot execute its server implementation while the network is unavailable. Offline reads and writes therefore need an explicit browser data store, mutation queue, retry policy, and reconciliation/conflict rules if the product requires them. Neither the Service Worker cache API nor Solid server functions supply that domain policy ([server-functions transport](https://v2.solidjs.com/building-apps/server-functions), [Service Worker cache model](https://w3c.github.io/ServiceWorker/#cache-interface)).

## Testing baseline

The repository currently runs one component test in a real headless Chromium page through Vitest Browser Mode and Playwright ([vite.config.ts](../../vite.config.ts), [counter.test.tsx](../../src/components/counter.test.tsx)). The verified commands `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm format:check` all passed on 2026-08-25. The exact plugin includes the earlier fix that prevents Browser Mode from being forced to jsdom ([plugin releases](https://github.com/solidjs/solid-vite-plugin/releases)).

Solid's testing guide separates three concerns: a small simulated DOM for fast component tests, Browser Mode for layout, CSS, focus, selection, and real browser APIs, and a Node Vitest project for full-stack request behavior. Full-stack tests need server-runtime aliases/inlining so request-event and storage modules use the same instance. With Vitest globals disabled, tests must also arrange explicit cleanup ([Solid testing guide](https://v2.solidjs.com/guides/testing)).

The current configuration covers only the browser component-test concern. It does not yet verify Node request handling, server-function transport, hydration, the production deployment adapter, service-worker lifecycle, offline reloads, queued mutations, or multi-client reconciliation. Browser component tests are not a substitute for exercising the built application through its deployment boundary ([Solid testing guide](https://v2.solidjs.com/guides/testing), [deployment preview limits](https://v2.solidjs.com/building-apps/deployment)).

## Facts the architecture ticket must decide against

1. **Rendering mode:** keep the final static client artifact, enable server functions without SSR, or retain the streaming SSR server bundle. Each choice changes hosting and testing obligations.
2. **Routing ownership:** select and pin the router, route-definition style, and API-route convention. Start mode does not choose them.
3. **Data authority:** decide where lists, items, locations, and route ordering are authoritative, including identity, authorization, and multi-client updates. Server functions only transport validated calls.
4. **Offline semantics:** define the browser store, cache/update strategy, queued-write format, retry behavior, conflict resolution, and what remains usable without a network. A service worker alone does not provide these semantics.
5. **Deployment target:** verify static-file precedence, Fetch handler adaptation, request bodies, streaming responses, multiple `Set-Cookie` headers, runtime dependencies, environment values, and any durable storage on the selected host.
6. **Test matrix:** add Node full-stack, built-host, hydration if selected, service-worker, offline, and reconciliation coverage in addition to current browser component tests.
7. **Prerelease policy:** pin upgrades deliberately and rerun production artifact, server, and Browser Mode proofs because the core is RC and the integration packages remain prerelease.

## Limitations

- This research did not choose a router, rendering mode, persistence engine, offline strategy, service-worker tool, or deployment provider.
- It did not install or execute optional router, filesystem-routing, provider, or PWA packages.
- It verified only the repository's current static build and existing diagnostics. It did not run an SSR/server-function build, a provider deployment, or an offline prototype.
- The Solid 2 pages and packages are prerelease material current on 2026-08-25. Package labels and behavior can change before stable; the pinned package README and observed artifact take precedence over assumptions from older SolidStart guidance.
