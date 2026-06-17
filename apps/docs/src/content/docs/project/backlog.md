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

| Pozycja                                     | Status      | Notatki                                                                                                                                                                                                      |
| ------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Weryfikacja E2E w Dockerze (19 pluginów)    | **Pending** | Lokalnie: `npm run e2e` — **38/38 passed** (Docker). Pozostaje: job `e2e` zielony na GitHub Actions po push. Checklist: [e2e-testing.md#verification-checklist](/guides/e2e-testing/#verification-checklist) |
| Commit / push zmian E2E + backlog na `main` | **Pending** | Zmiany w repo nie są jeszcze na remote — commit + push przed weryfikacją CI                                                                                                                                  |
| Branch protection na `main`                 | **Pending** | Checklist krok 8 — ręcznie w GitHubie: [monorepo-ci.md#faza-publikacji](/project/monorepo-ci/#faza-publikacji)                                                                                               |

## Deferred — odroczone

Pełne opisy i diagramy: [monorepo-ci.md#todo--do-rozwazenia](/project/monorepo-ci/#todo--do-rozwazenia).

| Pozycja                              | Priorytet | Link                                                              |
| ------------------------------------ | --------- | ----------------------------------------------------------------- |
| GitHub App bot dla release commitów  | P3        | [§1](/project/monorepo-ci/#1-github-app-bot-dla-release-commitów) |
| Pełne pinowanie SHA akcji GitHub     | P2        | [§2](/project/monorepo-ci/#2-pełne-pinowanie-sha-akcji-github)    |
| Codecov — matrix coverage per pakiet | P2        | [§3](/project/monorepo-ci/#3-codecov--matrix-coverage-per-pakiet) |
| Nx Release zamiast Changesets        | P4        | [§4](/project/monorepo-ci/#4-nx-release-zamiast-changesets)       |
| Nx Cloud (opcjonalny cache)          | P3        | [§5](/project/monorepo-ci/#5-nx-cloud-opcjonalny-cache)           |

## Cancelled — poza zakresem

| Pozycja                                | Notatki                                                                                                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm publish / Trusted Publisher (OIDC) | [publish.yml](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/.github/workflows/publish.yml) wyłączony; checklist krok 6 Cancelled w [monorepo-ci.md](/project/monorepo-ci/#faza-publikacji) |

## Done — ostatnie kamienie milowe (skrót)

| Pozycja                                                                            | Gdzie szczegóły                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 19 pluginów + 6 presetów                                                           | [domains.md](/reference/domains/)                                       |
| Preset `monorepo-ci-strict`, 10 workflowów, shift-left                             | [monorepo-ci.md](/project/monorepo-ci/)                                 |
| Infrastruktura E2E w repo (19× `e2e/plugin-*-e2e`, obrazy Docker, target Nx `e2e`) | [e2e-testing.md](/guides/e2e-testing/)                                  |
| Wersjonowanie `0.1.0` w repo (changesets, bez npm)                                 | [monorepo-ci.md#faza-publikacji](/project/monorepo-ci/#faza-publikacji) |

## Utrzymanie

- Nowa odroczona lub otwarta rzecz → wpis w **Pending** lub **Deferred** tutaj; szczegóły opcjonalnie w `monorepo-ci.md`.
- Po zamknięciu → przenieś do **Done** (z krótką notatką) lub usuń z **Pending**.
- Nie duplikuj pełnych tabel — linkuj do dokumentów szczegółowych.
