# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata

- **Project Name:** hieco
- **Date:** 2026-03-15
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC011 Header Showcase link navigates to the showcase index

- **Test Code:** [TC011_Header_Showcase_link_navigates_to_the_showcase_index.py](./TC011_Header_Showcase_link_navigates_to_the_showcase_index.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/d0bc552d-ca3a-41fb-9ffe-a565d50dfe1a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC012 Showcase index renders core discovery controls

- **Test Code:** [TC012_Showcase_index_renders_core_discovery_controls.py](./TC012_Showcase_index_renders_core_discovery_controls.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/3d8118c0-1881-428b-a274-990431f28d1e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC013 Showcase search updates the URL query string with wallet

- **Test Code:** [TC013_Showcase_search_updates_the_URL_query_string_with_wallet.py](./TC013_Showcase_search_updates_the_URL_query_string_with_wallet.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:

- URL query parameter 'q=wallet' not present after typing 'wallet' and submitting; current URL shows 'q=' (empty).
- No UI action (Enter submitted) resulted in the page updating the URL to include the search query.
- Search input value ('wallet') is not reflected in the router/URL state observable in the page, indicating the feature to write the query parameter is missing or not functioning.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/0d587085-40de-4a08-9f99-f39277af6b9b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC014 Prefilled showcase query hydrates the search input

- **Test Code:** [TC014_Prefilled_showcase_query_hydrates_the_search_input.py](./TC014_Prefilled_showcase_query_hydrates_the_search_input.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/7c591877-6c60-45fb-ac2a-316e1d8361c2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC015 Rare search query shows the empty-state copy

- **Test Code:** [TC015_Rare_search_query_shows_the_empty_state_copy.py](./TC015_Rare_search_query_shows_the_empty_state_copy.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:

- Search submission did not update the URL to include 'q=zzzzzz-nonexistent-project' after two attempts.
- Search input value remains 't' on the page (input index 487), indicating the typed query was not applied.
- The empty-state message 'No public projects match the current filters.' is not visible; the page shows '1 results' and a project card instead.
- Two attempts to type and submit the query were performed and both failed to change the UI state or URL.
- No visible alternative submit control (e.g., search button) was found that would apply the query instead of Enter.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/cb8abfbb-8cf0-4440-9d37-6dcf01ac48d1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC016 Clearing a no-results search restores the standard showcase view

- **Test Code:** [TC016_Clearing_a_no_results_search_restores_the_standard_showcase_view.py](./TC016_Clearing_a_no_results_search_restores_the_standard_showcase_view.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/78c65a41-c9cf-4dd4-9d20-462926616f06
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC017 Package filter popover opens from the showcase index

- **Test Code:** [TC017_Package_filter_popover_opens_from_the_showcase_index.py](./TC017_Package_filter_popover_opens_from_the_showcase_index.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/e549a633-2da2-4a88-9095-e8b430b4ba28
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC018 Toggling the Hieco Wallet package filter updates route state

- **Test Code:** [TC018_Toggling_the_Hieco_Wallet_package_filter_updates_route_state.py](./TC018_Toggling_the_Hieco_Wallet_package_filter_updates_route_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:

- Hieco Wallet checkbox interaction did not change the UI state: the checkbox remained unchecked (input id=filter-package-Hieco Wallet not checked; associated span aria-checked=false) after two attempts.
- URL 'packages' query parameter did not include the selected package — it remained an empty array (%5B%5D) after attempts to apply the filter.
- No observable change in page results or address bar indicating the filter was applied.
- Two attempts to toggle the Hieco Wallet checkbox timed out or had no effect within the UI.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/bbc56d83-6631-4b66-a236-d940aeb0dcbd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC019 Use-case filter popover opens from the showcase index

- **Test Code:** [TC019_Use_case_filter_popover_opens_from_the_showcase_index.py](./TC019_Use_case_filter_popover_opens_from_the_showcase_index.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/1e082296-5cd8-403d-b2f3-964816efa8a2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC020 Toggling the Developer Tools use-case filter updates route state

- **Test Code:** [TC020_Toggling_the_Developer_Tools_use_case_filter_updates_route_state.py](./TC020_Toggling_the_Developer_Tools_use_case_filter_updates_route_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3e977a21-a940-4a72-9a94-980734d7f55a/87991968-c671-47b5-85cd-3782172b3a5b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

## 3️⃣ Coverage & Matching Metrics

- **70.00** of tests passed

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
| ----------- | ----------- | --------- | --------- |
| ...         | ...         | ...       | ...       |

---

## 4️⃣ Key Gaps / Risks

## {AI_GNERATED_KET_GAPS_AND_RISKS}
