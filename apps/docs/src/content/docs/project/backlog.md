---
title: Backlog
description: Backlog — awesome-pushup-standards
---

# Backlog — otwarte i odroczone pozycje

**Operacyjne źródło prawdy** dla tego, co jest niewykonane, odroczone lub poza zakresem. Szczegóły techniczne CI/CD: [monorepo-ci.md](/project/monorepo-ci/). Wizja i fazy historyczne: [PLAN.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/PLAN.md).

## Taksonomia statusów

| Status        | Znaczenie                                                       |
| ------------- | --------------------------------------------------------------- |
| **Done**      | Zaimplementowane i zweryfikowane (lokalnie + CI, jeśli dotyczy) |
| **Pending**   | Zaimplementowane lub zaplanowane — wymaga jeszcze działania     |
| **Deferred**  | Świadomie odłożone — wrócić później                             |
| **Cancelled** | Poza zakresem repozytorium                                      |

## Pending — najbliższe kroki

| Pozycja                                  | Status      | Notatki                                                                                                                                   |
| ---------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Weryfikacja E2E w Dockerze (19 pluginów) | **Pending** | Lokalnie: **38/38 passed**. Pozostaje: job `e2e` zielony na GitHub Actions. [e2e-testing.md](/guides/e2e-testing/#verification-checklist) |
| Wiki Starlight (sync README → docs)      | **Done**    | `npm run docs:sync`, 25 stron pakietowych, [Documentation registry](/reference/documentation-registry/)                                   |
| Branch protection na `main`              | **Pending** | Checklist krok 8 — ręcznie w GitHubie: [monorepo-ci.md#faza-publikacji](/project/monorepo-ci/#faza-publikacji)                            |

## Deferred — odroczone

Pełne opisy i diagramy: [monorepo-ci.md#todo--do-rozwazenia](/project/monorepo-ci/#todo--do-rozwazenia).

| Pozycja                                                     | Priorytet | Link / notatki                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Documentation registry per plugin/domain**                | P3        | Każdy plugin/preset: kategoria docs (język/domena), status README + strona Starlight, `publishedVia`; wymuszane w scaffoldzie — [Documentation registry](/reference/documentation-registry/)                                                                                                                                                                                                                                                               |
| **`docs-quality`: audyty sync wiki**                        | P3        | Rozszerzyć plugin `docs-quality` o automatyczne sprawdzanie, czy dokumentacja jest **generowana i zebrana**: wpis w `doc-registry.json`, strona Starlight `plugins/<slug>` / `presets/<slug>`, spójność z `packages/*/README.md` (np. audyty `doc-registry-entry`, `starlight-page-synced`); opcjonalnie weryfikacja, że `npm run docs:sync` nie zostawił luk przed `docs:build` w CI                                                                      |
| **GitHub Pages dla wiki Starlight**                         | P3        | Publiczny URL docs; na razie CI artifact `docs-dist` z `npm run docs:build`                                                                                                                                                                                                                                                                                                                                                                                |
| **Simplicity audit** — sekcja raportu per plugin / preset   | P4        | Przegląd zmian w kodzie pod kątem reuse, uproszczeń, dead-code / „altitude” cleanups; osobna kategoria audytów obok istniejących quality checks                                                                                                                                                                                                                                                                                                            |
| **Bloat / code-review audit** — wykrywanie rozrostu kodu    | P4        | Osobna opcja (podobna do Simplicity, ale skoncentrowana na bloat i review diffów); do rozważenia jako plugin, rozszerzenie `llm-review`, lub wspólny moduł                                                                                                                                                                                                                                                                                                 |
| **Naming & structure conventions (single source of truth)** | P4        | Mglisty pomysł do rozważenia: wspólne reguły i audyty dla **nazw plików**, **architektury folderów**, **struktury plików**, **nazw zmiennych/funkcji/typów** i pokrewnych konwencji; jeden manifest (np. YAML/JSON obok `doc-registry` lub osobny `conventions-registry`) jako **źródło prawdy**, z którego budowane są checki w pluginach (contributor-hygiene, architecture-rules, nowy plugin „conventions”) — bez duplikowania reguł w wielu miejscach |
| GitHub App bot dla release commitów                         | P3        | [§1](/project/monorepo-ci/#1-github-app-bot-dla-release-commitów)                                                                                                                                                                                                                                                                                                                                                                                          |
| Pełne pinowanie SHA akcji GitHub                            | P2        | [§2](/project/monorepo-ci/#2-pełne-pinowanie-sha-akcji-github)                                                                                                                                                                                                                                                                                                                                                                                             |
| Codecov — matrix coverage per pakiet                        | P2        | [§3](/project/monorepo-ci/#3-codecov--matrix-coverage-per-pakiet)                                                                                                                                                                                                                                                                                                                                                                                          |
| Nx Release zamiast Changesets                               | P4        | [§4](/project/monorepo-ci/#4-nx-release-zamiast-changesets)                                                                                                                                                                                                                                                                                                                                                                                                |
| Nx Cloud (opcjonalny cache)                                 | P3        | [§5](/project/monorepo-ci/#5-nx-cloud-opcjonalny-cache)                                                                                                                                                                                                                                                                                                                                                                                                    |

## Cancelled — poza zakresem

| Pozycja                                | Notatki                                                                                                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm publish / Trusted Publisher (OIDC) | [publish.yml](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/.github/workflows/publish.yml) wyłączony; checklist krok 6 Cancelled w [monorepo-ci.md](/project/monorepo-ci/#faza-publikacji) |

## Done — ostatnie kamienie milowe (skrót)

| Pozycja                                                                            | Gdzie szczegóły                                                                    |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 19 pluginów + 6 presetów                                                           | [domains.md](/reference/domains/)                                                  |
| Preset `monorepo-ci-strict`, 10 workflowów, shift-left                             | [monorepo-ci.md](/project/monorepo-ci/)                                            |
| Infrastruktura E2E w repo (19× `e2e/plugin-*-e2e`, obrazy Docker, target Nx `e2e`) | [e2e-testing.md](/guides/e2e-testing/)                                             |
| E2E contract standard: preflight narzędzi, 38/38 collects, push na `main`          | [e2e-testing.md#e2e-contract-standard](/guides/e2e-testing/#e2e-contract-standard) |
| Wiki Starlight: sync `packages/*/README.md`, documentation registry, CI artifact   | [documentation-registry](/reference/documentation-registry/)                       |
| Wersjonowanie `0.1.0` w repo (changesets, bez npm)                                 | [monorepo-ci.md#faza-publikacji](/project/monorepo-ci/#faza-publikacji)            |

## Utrzymanie

- Nowa odroczona lub otwarta rzecz → wpis w **Pending** lub **Deferred** tutaj; szczegóły opcjonalnie w `monorepo-ci.md`.
- Po zamknięciu → przenieś do **Done** (z krótką notatką) lub usuń z **Pending**.
- Nie duplikuj pełnych tabel — linkuj do dokumentów szczegółowych.
