# Tab Out First Glance Optimization Design

Date: 2026-05-28
Status: Draft for user review

## Goal

Improve Tab Out's first-glance experience for an A+C product direction: faster cleanup plus a more delightful, share-worthy first impression. The next iteration should help users immediately answer:

- How messy are my tabs right now?
- Which group should I clean first?
- Why is this group important?
- What safe action can I take next?

This is a medium-sized product upgrade. It should preserve Tab Out's pure Chrome extension architecture, current interaction model, and local-only privacy promise.

## Chosen Direction

Use a hybrid of:

- **Priority Grid**: Keep the current domain-card grid, but rank cards by cleanup value instead of raw tab count alone.
- **Compact Health Header**: Add a restrained summary strip above the grid with actionable signals.

This avoids turning Tab Out into a heavy assistant. It stays lightweight, but the dashboard feels smarter the moment it opens.

## Non-Goals

- No backend, accounts, sync, analytics, or external APIs.
- No onboarding wizard in this iteration.
- No share card, streaks, or social export yet.
- No automatic closing. All cleanup actions remain user-triggered.
- No complex ML-style recommendation engine.

## First-Screen Information Architecture

Keep the existing greeting and date header.

Add a compact **Tab Health** summary above the open-tabs section. It should present three to four actionable metrics:

- **Open tabs**: Count of real web tabs.
- **Duplicates**: Number of duplicate extras that can be closed while keeping one copy.
- **Biggest group**: The largest domain group and its tab count.
- **Homepages**: Count of homepage tabs, shown only when present.

The summary should feel like a calm status strip, not a warning panel. It should use short, positive copy such as "12 easy closes" rather than guilt-heavy language.

The existing card grid remains the main surface. Cards are sorted by cleanup priority, and high-priority cards show small explanation badges such as:

- `4 duplicates`
- `largest group`
- `homepage cleanup`
- `12 tabs`

Cards should not show raw numeric scores.

## Cleanup Priority Model

Each open-tab group gets a `cleanupScore` and a list of human-readable `priorityReasons`.

Recommended inputs:

- `duplicateExtraCount`: Highest-value signal. Repeated exact URLs mean the user can safely close extras.
- `tabCount`: Large groups matter, but this should have lower weight than duplicates.
- `isHomepageGroup`: Homepages are usually low-risk cleanup targets, so this group receives a fixed boost.
- `isLocalhost`: Do not penalize or boost localhost groups. Developers may intentionally keep several local project tabs open.
- `customGroupLabel`: Custom groups should work with the same rules as normal groups, but their label should be preserved in the UI.

Suggested scoring shape:

```text
score =
  duplicateExtraCount * 20
  + min(tabCount, 20) * 2
  + (isHomepageGroup ? 12 : 0)
```

The exact numbers can be tuned during implementation, but the ordering principle should hold:

1. Groups with duplicates come first.
2. Homepages come before ordinary groups when cleanup value is similar.
3. Very large groups come before small groups.
4. Localhost remains readable but not over-prioritized.

## Sorting Behavior

Current sorting is mostly landing pages first, then priority domains, then tab count. Replace that with cleanup priority while preserving the special Homepages group.

Recommended order:

1. Homepages, when present and meaningful.
2. Groups with duplicate extras, sorted by duplicate extras then total tab count.
3. Large groups, sorted by tab count.
4. Other groups, sorted by tab count.

If the score-based implementation is simpler, use score as the primary sort key and tab count as the secondary key. Ensure Homepages remain easy to find near the top.

## Interaction Design

Existing interactions stay intact:

- Click a tab chip to focus that tab.
- Close a single tab from its chip.
- Save a single tab for later, then close it.
- Close all tabs in a group.
- Close duplicate extras while keeping one copy.
- Use the saved-for-later sidebar and archive.

New interactions should be minimal:

- The Tab Health summary may include one action for duplicate cleanup only if it is scoped and clear.
- If a summary action is added, it should reuse the existing duplicate-close behavior and copy should state what will be closed.
- Do not add automatic cleanup or hidden behavior.

High-priority visual treatment should guide attention without changing semantics:

- Stronger top border for high-priority cards.
- Reason badges in the card header.
- More obvious duplicate badges.
- Keep danger actions visually restrained unless the user is hovering or focusing them.

## Delight Layer

Delight should reinforce successful cleanup, not distract from scanning.

Keep:

- Existing swoosh sound.
- Existing confetti burst.
- Existing empty state.

Improve:

- Toast messages should include the concrete result when possible, such as "Closed 4 duplicates from YouTube."
- Empty state can be slightly more specific after cleanup, such as "All open web tabs are cleared."
- Summary copy should feel friendly and empowering.

Do not add:

- Streaks.
- Share images.
- Gamified points.
- Social copy.

These can be considered after the first-glance cleanup loop is working.

## Error Handling And Safety

The new priority and summary logic must not change tab-closing scope.

Preserve existing safety behavior:

- Homepages and custom groups close by exact URL.
- Normal domain groups close by hostname.
- Duplicate cleanup closes exact URL duplicates while keeping one copy.
- Tab Out duplicate cleanup keeps the current active Tab Out tab.

If a score or summary cannot be computed, the dashboard should fall back to the current card rendering and tab-count sorting.

The global "Close all open tabs" action is high-risk. This iteration should keep its copy explicit and visually secondary. If moved into the health summary, it must remain clearly labeled as all open web tabs.

## UI Layout Requirements

- The health summary must fit above the open-tabs grid on desktop.
- When the saved-for-later sidebar is visible, the open-tabs grid must still have enough width for card columns.
- On narrow screens, the health summary should wrap into compact metric rows without overflow.
- Badges and card titles must not overlap action buttons.
- Text should use the existing visual language: warm paper background, small badges, restrained amber/sage/rose accents.

## Implementation Notes

Likely implementation areas:

- `extension/app.js`
  - Add derived group metrics.
  - Add cleanup scoring and priority reasons.
  - Update group sorting.
  - Render the Tab Health summary.
  - Improve toast copy for cleanup results.
- `extension/index.html`
  - Add a summary container above the open-tabs section.
- `extension/style.css`
  - Style the summary strip.
  - Style priority reason badges and high-priority card states.
  - Add responsive behavior.

No build step or dependency should be introduced.

## Test Plan

Manual scenarios:

1. No duplicates, small number of tabs.
2. Many duplicate URLs across one domain.
3. Multiple homepage tabs.
4. One very large domain group.
5. Localhost tabs with different ports.
6. Custom group rules from `config.local.js`.
7. Saved-for-later sidebar visible.
8. Narrow viewport.

Verification checks:

- Health summary counts match visible real web tabs.
- Duplicate count means extras only, not total duplicate URL instances.
- Highest-priority cards appear first.
- Reason badges explain the ordering.
- Closing a group still closes the same tabs as before.
- Closing duplicates keeps one copy.
- Summary and card counts update after close/save actions.
- No layout overflow on desktop or mobile widths.

## Future Follow-Ups

Potential later C-direction improvements:

- First-run welcome hint.
- Cleanup result summary.
- Before/after snapshot.
- Optional keyboard shortcuts.
- A command palette for heavy users.

These should wait until the priority dashboard proves useful.
