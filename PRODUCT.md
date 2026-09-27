# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the **gestor de projecto** (project manager) of a single construction/engineering company in Angola. They open SGO to plan activities, assign and monitor tasks, approve expenses and payments, request materials, and read the physical and financial execution of the projects they are responsible for. Their day is split between the office and the site, and they are the person who has to answer "where is this project, physically and financially?" without asking anyone.

Confirmed secondary users, all internal to the same company:

- **Encarregado** (site foreman) — records the site diary, photographs, progress and material requests; works from a phone.
- **Fiscal** (inspector) — verifies work and describes costs; read access plus financial visibility, no write access.
- **Colaborador** — contributes to activities, tasks and documents; write access, no financial visibility.
- **Proprietário / Administrador** — oversight across all projects; bypasses per-project roles.
- **Consulta** — sees a project, changes nothing.

There are no external accounts. Clients, suppliers and inspectors are recorded as data (fornecedores, documentos, indicadores), not as users.

## Product Purpose

SGO is a construction project management system: one record per project that holds the whole lifecycle of the work — activities and tasks, the site diary, photographs, documents, materials and requisitions, expenses and payments, meetings, decisions, and the cost/schedule/quality/safety indicators — instead of the spreadsheets, shared drives and whiteboards the company uses today.

It exists because the physical truth of a project (what was actually built, when, and who recorded it) and its financial truth (what was approved, what was paid) currently live apart and disagree. SGO's job is to keep them on the same project, under the same permissions, with a record of who changed what.

Success means the gestor can open one project and see current progress, current cost, what is late, and what is waiting on his approval, without exporting anything, and without asking the site for a status update.

## Positioning

The whole lifecycle of one construction project in one place, with per-project roles attached to it.

Neighbouring tools solve one slice — task tracking, expense claiming, document filing, photo albums — and none of them can answer, for a single project, "what is built, what did it cost, who approved it, and what is late" in one place. SGO's mechanism is the project as the unit of context: every record belongs to a project, access is granted by the user's role *in that project*, and the physical and financial execution percentages are recalculated from the records themselves rather than typed in. Records written in the field on a phone and the approvals written in the office resolve to the same project record.

Not claimed: SGO is not a BIM tool, not an accounting package, and not a certified measurement/certification (medições) system.

## Operating Context

- Angola, construction and civil works. Currency is the Kwanza (AOA).
- Users are the same digitally-confident people in the office and on site; the field capture paths (site diary, photographs, material requisitions) must work on a phone, and must tolerate poor connectivity.
- The company runs several projects at once; a user may hold a different role, or no role, in each one.
- The site diary is a legal/contractual register of the work, not a chat log. Entries, photographs and approvals are evidence.
- Daily rituals the product must support: recording what happened on site that day, approving submitted expenses, chasing late activities and tasks, and checking the month's spending against the contract value.
- The interface is used where the network is unreliable and where a phone may be the only device at hand.

## Capabilities and Constraints

Confirmed capability, already present in the data layer and policies (no interface exists yet for any of it):

- Projects with area, gestor, client, address, dates, contract value, budget (previsto/actual), overall state (Planeamento, Em execução, Suspenso, Cancelado), physical and financial execution percentages, and administrative closure flag.
- Activities, tasks, and the overdue marking command `actividades:marcar-atrasadas` that flips expired items to Atrasada and recomputes physical execution.
- Expenses with category (mão de obra, material, equipamento, subcontratação, outro) and approval state; payments with Pendente/Pago/Atrasado; automatic financial recomputation from approved expenses against the contract value; notifications on approval and on task assignment.
- Materials, material requisitions, suppliers, documents (contracto, licença, planta, especificação, factura), site diary, photographs, meetings (obra, cliente, interna, fornecedor) with participants, decisions, calendar events, and indicators (custo, prazo, qualidade, segurança).
- Full activity log (audit trail) on the records that carry it.
- Access model: per-project role (Gestor, Colaborador, Fiscal, Consulta) with separate read / write / financial-visibility permissions, plus total-access profiles that override the role. Listings are filtered to visible projects rather than refused, so an empty screen is a legitimate state.

Constraints future work must preserve:

- **Language: European Portuguese, Angola.** The entire domain model, enum labels, policies and code comments are written in pre-AO European Portuguese (`Projecto`, `Actividade`, `Reunião`, `injectado`, `Diário de Obra`, `Encarregado`, `Fiscal`, `Factura`, `Objectivo`). Interface copy must match this register exactly and must not drift into Brazilian Portuguese. `config/app.php` is still `en`/`en_US`; locale is unconfigured.
- **Currency.** Money is stored as `decimal:2` with no currency column and no currency configuration anywhere in the app. Kwanza is the only confirmed currency; displaying or formatting money must assume AOA until a configuration exists.
- **No tenant column.** Users are global; there is one organisation. Do not add multi-tenancy, signup or billing surfaces.
- **Starts empty.** No import from spreadsheets, no migration of legacy data, and no requirement to print or export official documents.
- **Measurement/medições.** Physical execution is a plain average of activity completion, and financial execution assumes approved expenses equal work executed. Both are documented simplifications in the code and are explicitly allowed to be replaced later by a medições entity.
- Stack is fixed by the existing codebase: Laravel 13, Inertia + React 19, Tailwind CSS 4, Pest, MySQL. Only Laravel Breeze's default scaffold screens exist; every domain screen is unbuilt.

## Evidence on Hand

- The full database schema, models, enums, policies, observers, notifications, the overdue command and the Pest feature tests for project access, audit log, agenda and the expense observer. This is the authoritative statement of what the product is.
- Committed screenshots/fixtures: none. The only visual truth is the Breeze default scaffold (Laravel/Inertia), which is scaffolding, not design.
- Real project data, client names, testimonials, case studies, press: **none**. Nothing about real budgets, real volumes or real outcomes may be invented to fill a screen.
- Brand assets: none in the repository — no logo, no mark, `APP_NAME` is still `Laravel`, and `public/` holds only the Breeze favicon.

## Product Principles

1. **One project is the unit of truth.** Every record belongs to a project and inherits its access rules. Cross-project views are summaries over that same truth, never a parallel source.
2. **Derived numbers, never typed numbers.** Execution percentages, overdue states and totals are computed from records so that the project view can never disagree with the underlying entries.
3. **The record is evidence.** Site diary entries, photographs, approvals and payments are a contractual trail; they are append-and-annotate, never quietly rewritten, and who changed what stays visible.
4. **Role-shaped, not role-decorated.** Permissions are structural (a Consultation user's screen has no write affordance at all, not a disabled one) and identical rules apply everywhere in the product.
5. **Empty and waiting are real states.** A project with nothing recorded, an approval queue with nothing in it, and an overdue project are outcomes the interface must present, not errors to hide.
6. **The site is not an office.** Anything captured on a phone on a bad connection must be reachable and completable in that condition; the office is the wider case, not the base case.

## Brand Commitments

- Name: **SGO**, Sistema de Gestão de Obra. This is the working name from the repository.
- Voice: the product's own register is the codebase's — plain, technical, European Portuguese, engineering-office register. No marketing voice, no exclamation marks, no claims.
- No visual identity is committed. There is no logo, no palette, no type direction and no reference the user has made binding. `APP_NAME` still reads `Laravel`.
