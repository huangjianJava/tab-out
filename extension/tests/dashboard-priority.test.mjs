import test from 'node:test';
import assert from 'node:assert/strict';

/*
Initial red run verified before implementation:
Command: node --test extension/tests/dashboard-priority.test.mjs
Result: ERR_MODULE_NOT_FOUND for ../lib/dashboard-priority.mjs
*/
import {
  HOMEPAGE_DOMAIN,
  annotateGroupsWithPriority,
  buildHealthSummary,
  formatCleanupToast,
} from '../lib/dashboard-priority.mjs';

test('annotateGroupsWithPriority sorts groups by cleanup score and applies strict reason precedence', () => {
  const groups = [
    {
      domain: 'github.com',
      tabs: [
        { url: 'https://github.com/openai/openai' },
        { url: 'https://github.com/openai/openai' },
        { url: 'https://github.com/openai/openai/issues' },
      ],
    },
    {
      domain: HOMEPAGE_DOMAIN,
      tabs: [
        { url: 'https://mail.google.com/mail/u/0/#inbox' },
        { url: 'https://github.com/' },
      ],
    },
    {
      domain: 'docs.example.com',
      tabs: Array.from({ length: 8 }, (_, index) => ({
        url: `https://docs.example.com/page-${index + 1}`,
      })),
    },
    {
      domain: 'local-files',
      tabs: [{ url: 'file:///Users/demo/notes.txt' }],
    },
  ];

  const annotated = annotateGroupsWithPriority(groups);

  assert.deepEqual(
    annotated.map(group => group.domain),
    ['github.com', 'docs.example.com', HOMEPAGE_DOMAIN, 'local-files'],
  );

  assert.equal(annotated[0].label, 'GitHub');
  assert.equal(annotated[0].tabCount, 3);
  assert.equal(annotated[0].duplicateExtraCount, 1);
  assert.equal(annotated[0].cleanupScore, 26);
  assert.deepEqual(annotated[0].priorityReasons, ['1 duplicate tab']);
  assert.equal(annotated[0].priorityTone, 'duplicate');

  assert.equal(annotated[1].label, 'Docs Example');
  assert.equal(annotated[1].cleanupScore, 16);
  assert.deepEqual(annotated[1].priorityReasons, ['Largest group: 8 tabs']);
  assert.equal(annotated[1].priorityTone, 'large');

  assert.equal(annotated[2].label, 'Homepages');
  assert.equal(annotated[2].cleanupScore, 16);
  assert.deepEqual(annotated[2].priorityReasons, ['Homepage cleanup']);
  assert.equal(annotated[2].priorityTone, 'homepage');

  assert.equal(annotated[3].label, 'Local Files');
  assert.deepEqual(annotated[3].priorityReasons, ['1 tab open']);
  assert.equal(annotated[3].priorityTone, 'neutral');
});

test('buildHealthSummary returns totals and biggest group details', () => {
  const groups = [
    {
      domain: 'youtube.com',
      tabs: [
        { url: 'https://www.youtube.com/watch?v=1' },
        { url: 'https://www.youtube.com/watch?v=1' },
        { url: 'https://www.youtube.com/watch?v=2' },
      ],
    },
    {
      domain: HOMEPAGE_DOMAIN,
      tabs: [
        { url: 'https://mail.google.com/mail/u/0/#inbox' },
        { url: 'https://github.com/' },
        { url: 'https://www.youtube.com/' },
      ],
    },
    {
      domain: 'docs.example.com',
      tabs: Array.from({ length: 5 }, (_, index) => ({
        url: `https://docs.example.com/page-${index + 1}`,
      })),
    },
  ];

  assert.deepEqual(buildHealthSummary(groups, 11), {
    openTabs: 11,
    duplicateExtras: 1,
    homepageCount: 3,
    biggestGroup: {
      label: 'Docs Example',
      tabCount: 5,
    },
  });
});

test('formatCleanupToast returns human-readable duplicate and group cleanup messages', () => {
  assert.equal(
    formatCleanupToast({ kind: 'duplicates', groupLabel: 'GitHub', closedCount: 2 }),
    'Closed 2 duplicate tabs in GitHub',
  );

  assert.equal(
    formatCleanupToast({ kind: 'duplicates', groupLabel: 'YouTube', closedCount: 1 }),
    'Closed 1 duplicate tab in YouTube',
  );

  assert.equal(
    formatCleanupToast({ kind: 'group', groupLabel: 'Homepages', closedCount: 4 }),
    'Closed 4 tabs from Homepages',
  );

  assert.equal(
    formatCleanupToast({ kind: 'group', groupLabel: 'Local Files', closedCount: 1 }),
    'Closed 1 tab from Local Files',
  );
});
