# Offline-sync foundations

Researched on 2026-08-25 for [issue 8](https://github.com/better-salmon/shopping-list/issues/8). This is a bounded, primary-source comparison. It records facts and tradeoffs; it does not select the architecture.

## Required meaning of offline sync

An optimistic screen is not enough. A qualifying foundation must preserve a browser write through reload while offline, upload it later, and define the result of concurrent writes from two devices. PWA asset caching is separate. The repository's exact Solid 2 RC, TypeScript 6, Vite 8, and Node 26 combination is not explicitly certified by any candidate reviewed; peer ranges are not runtime proof.

## Comparison

| Foundation                  | Local write and convergence                                                                                                                                      | Hosted boundary                                                                                       | Evolution and recovery                                                                                                             | Hard limit                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Triplit**                 | IndexedDB gives a durable cache/outbox; synchronization is CRDT-based. The default memory store loses pending writes on reload.                                  | Docker server; external JWT issuer; schema rules authorize claims.                                    | Only additive optional schema changes are backward compatible. Durable server storage, backup, and restore are operator work.      | Integrated option, but AGPL, breaking migrations, and the exact toolchain need review.                |
| **PowerSync**               | Local SQLite and a FIFO upload queue; source database is authoritative, not a client CRDT merge.                                                                 | Needs the PowerSync service, source and bucket databases, application write API, and token issuer.    | Source schema, client schema, and sync rules are separate surfaces. Bucket state can rebuild from the source, which needs backups. | Viable sync layer, not a complete backend; browser VFS and rejected writes are application decisions. |
| **InstantDB (self-hosted)** | Optimistic/offline transactions and IndexedDB query caching are documented; durable unsent writes across reload and precise conflicts are not specified clearly. | Includes auth, permissions, Postgres, object storage, dashboard, and proxy.                           | CLI migrations and export/restore exist; stale offline-client compatibility is unspecified.                                        | New cloud sign-ups are closed. A new app must self-host a relatively broad stack.                     |
| **LiveStore**               | OPFS persistence; globally ordered event sync and client rebase. Conflict handling is explicitly unfinished.                                                     | Auth is application-owned. Cloudflare is ready-made; self-controlled hosting needs a custom provider. | Events need explicit backward compatibility. Reset/rebuild exists, but compaction and production checklist are unfinished.         | Beta with production-critical gaps and browser/private-mode constraints.                              |
| **Electric + TanStack DB**  | No durable write path by itself. The application must add an outbox, mutation API, retry, and rollback.                                                          | Electric can self-host beside Postgres; an app API/proxy owns writes and authorization.               | Application-owned across database, client collections, and mutations.                                                              | Useful parts, but incomplete without another durable local/write foundation.                          |

## Triplit

The client applies writes locally, appends them to an outbox, reconnects automatically, and uses CRDT synchronization. Its default store is memory, so a refresh loses cache and outbox; durable browser behavior requires `storage: 'indexeddb'`. Partial replication also means the client holds only subscribed and permitted data. [Offline-mode documentation](https://www.triplit.dev/docs/offline-mode)

The Docker server defaults to an in-memory database. A durable deployment must select SQLite or LMDB and persist its storage. External authentication supplies a JWT; Triplit verifies it and evaluates schema permissions against its claims. [Self-hosting](https://www.triplit.dev/docs/self-hosting) [Authentication](https://www.triplit.dev/docs/auth)

Adding collections or optional attributes is backward compatible. Removing, renaming, changing types, or adding required attributes requires staged data/application migration or client-cache reset, and incompatible clients can be refused. [Updating schemas](https://www.triplit.dev/docs/schemas/updating)

The project is AGPL-3.0-only. Its Solid package permits any Solid peer version but is developed against Solid 1.x and TypeScript 5.x; that is not proof for this repository's prereleases. [License](https://github.com/aspen-cloud/triplit/blob/main/LICENSE) [Solid package manifest](https://github.com/aspen-cloud/triplit/blob/main/packages/solid/package.json)

Decision constraints: explicitly enable IndexedDB; provide identity, persistent volume, backup, and restore; define an old-client migration protocol; review AGPL; and run an exact-version spike.

## PowerSync

The Web SDK commits a mutation to local SQLite, queues it, and calls application-supplied `uploadData()`. Uploads are FIFO and retried, so one unacknowledged operation can block later work. [Client architecture](https://docs.powersync.com/architecture/client-architecture)

Synchronized server state is authoritative. Checkpoints wait for preceding mutations, then reconcile optimistic data with the source database. Rejected or transformed writes therefore need application-defined conflict and error UX. [Consistency](https://docs.powersync.com/architecture/consistency) [Application backend](https://docs.powersync.com/configuration/app-backend/setup)

Web storage modes have real product constraints. IndexedDB is the default; OPFS variants differ across Safari/iOS, Chromium, private mode, SharedWorker support, and multi-tab use. The final adapter must be tested on target phones. [JavaScript Web SDK](https://docs.powersync.com/client-sdks/reference/javascript-web)

Open Edition self-hosting still needs an authoritative source database, bucket database, mutation backend, and token issuer. Bucket storage can be recreated from the source database; the source requires backups, and self-hosted buckets require scheduled compaction. [Self-hosting](https://docs.powersync.com/intro/self-hosting) [Deployment architecture](https://docs.powersync.com/maintenance-ops/self-hosting/deployment-architecture) [Bucket compaction](https://docs.powersync.com/maintenance-ops/compacting-buckets)

The service uses FSL-1.1-ALv2 with an Apache-2.0 future license and a competing-use restriction. The framework-independent Web package has no explicit Node engine, which does not establish Node 26 compatibility. [Service license](https://github.com/powersync-ja/powersync-service/blob/main/service/LICENSE) [Web package manifest](https://github.com/powersync-ja/powersync-js/blob/main/packages/web/package.json)

Decision constraints: build and operate authenticated/idempotent mutations; handle a poison FIFO item; coordinate three schema/config surfaces; choose browser storage deliberately; review the service license; and prove the toolchain.

## InstantDB

InstantDB applies transactions optimistically and sends them to a backend using a Postgres triple store. Its repository documents an IndexedDB cache for recent queries. The reviewed docs do not make a precise guarantee that unsent transactions survive a full reload, so this must be tested. [Architecture](https://github.com/instantdb/instant/blob/main/client/www/_posts/architecture.md) [Repository](https://github.com/instantdb/instant)

It has first-party Solid, authentication, and server permission rules. The Solid package accepts Solid `>=1.0.0`, but its development toolchain uses Solid 1.x and TypeScript 5.x; the exact repository combination remains unproved. [Solid guide](https://www.instantdb.com/docs/start-solidjs) [Authentication](https://www.instantdb.com/docs/auth) [Permissions](https://www.instantdb.com/docs/permissions) [Package manifest](https://github.com/instantdb/instant/blob/main/client/packages/solidjs/package.json)

The self-host stack includes the application server, dashboard, Postgres, MinIO, and proxy. The VPS guide asks for three DNS names and a 2-vCPU/4-GB baseline. Schema CLI push/rename and backup export/restore are documented, but stale offline-client migration behavior is not. [Self-hosting](https://www.instantdb.com/docs/self-hosting) [VPS guide](https://www.instantdb.com/docs/self-hosting/vps) [CLI](https://www.instantdb.com/docs/cli) [Backups](https://www.instantdb.com/docs/backups)

The team announced its move to OpenAI, closed Instant Cloud to new sign-ups, and set hosted shutdown for 2027-08-31 while keeping the software open source and self-hostable. Future maintenance risk is an inference, not an announced end of the project. [Announcement](https://www.instantdb.com/essays/instant_team_joins_openai)

Decision constraints: prove reload durability and concurrent edits; accept self-host-only operation; plan Postgres/object-store recovery; define old-client behavior; and run the exact-version spike.

## LiveStore

LiveStore is an event-sourced local-first client. A sync backend assigns global order and clients rebase pending events, but its docs say merge-conflict handling and event-log compaction are not implemented. Ordering alone is not complete domain conflict semantics. [Syncing](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/building-with-livestore/syncing.mdx)

The web adapter uses OPFS and SharedWorker coordination. Safari and Firefox private modes can fall back to volatile memory, and Android Chrome lacks the required SharedWorker behavior for the same multi-tab model. [Web adapter](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/platform-adapters/web-adapter.mdx)

Authentication and authorization are application-owned. Cloudflare is the documented provider; a custom provider must implement persistence, transport, order, retries, and security. Event compatibility is also application-owned. The project describes beta storage resets and its production checklist is still `TBD`. [Authentication](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/patterns/auth.mdx) [Custom provider](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/sync-providers/custom.md) [App evolution](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/patterns/app-evolution.mdx) [Project state](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/misc/state-of-the-project.md) [Production checklist](https://github.com/livestorejs/livestore/blob/main/docs/src/content/docs/building-with-livestore/production-checklist.mdx)

Decision constraints: unfinished conflicts, compaction, and production guidance are blocking facts; self-hosting means writing a sync backend; private/mobile modes need proof; and the evolving packages need an exact-version spike.

## Electric with TanStack DB

Electric intentionally supplies a Postgres read path, not a built-in write-sync path. Its guide treats online writes, volatile optimistic writes, and application-built persistent optimistic writes as separate patterns. TanStack DB likewise delegates durable server mutation and rollback to mutation handlers. An RxDB collection can add persistence, but then RxDB and its replication protocol become part of the architecture. [Electric writes](https://electric-sql.com/docs/guides/writes) [TanStack mutations](https://tanstack.com/db/latest/docs/guides/mutations) [RxDB collection](https://tanstack.com/db/latest/docs/collections/rxdb-collection)

Electric can self-host beside Postgres, while an application proxy/gatekeeper supplies authorization and the write API. This composition is viable only after those missing components and semantics are designed; it does not answer the ticket alone. [Authentication](https://electric-sql.com/docs/guides/auth) [Deployment](https://electric-sql.com/docs/guides/deployment)

## Facts the architecture decision must use

1. Define offline acceptance for create, toggle, edit, delete, list move, and route reorder across reload, reconnect, rejection, and retry.
2. Select semantics per operation. Checkbox toggles, quantity edits, deletes, and concurrent ordering do not necessarily want the same CRDT, server-authority, or total-order rule.
3. Separate identity, server authorization, and local retention. Logout does not by itself erase durable browser data.
4. Treat schema evolution as a protocol for an old device that reconnects several releases later.
5. Name and back up the canonical authority, then test restore while clients have pending writes. Client caches are not backups.
6. Test normal and private iOS Safari, Android Chrome, reload offline, quota pressure, interrupted upload, and two tabs.
7. Count the full topology: identity, write API, source and sync databases, object storage, proxy, migrations, compaction, monitoring, and restore.
8. Install, type-check, build, and exercise each survivor with the repository's exact Solid, TypeScript, Vite, and Node versions.
9. Review AGPL and FSL obligations before implementation.

## Limitations

This was documentation research, not a benchmark or prototype, and it is not an exhaustive survey. It did not test packages, phones, quotas, concurrent domain operations, stale-client migrations, restore with pending writes, operating cost, or license obligations. Source statements can also change after the research date.

The next decision step should first reduce candidates using license and operational constraints, then apply one identical proof to each survivor: two real mobile browsers, one self-hosted deployment, offline reload, concurrent edits, a rejected write, a breaking migration, and backup/restore. Record observed behavior instead of relying on a generic "local-first" label.
