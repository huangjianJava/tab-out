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

  assert.equal(annotated[0].displayLabel, 'GitHub');
  assert.equal(annotated[0].tabCount, 3);
  assert.equal(annotated[0].duplicateExtraCount, 1);
  assert.equal(annotated[0].cleanupScore, 26);
  assert.deepEqual(annotated[0].priorityReasons, ['1 个重复标签页']);
  assert.equal(annotated[0].priorityTone, 'duplicate');
  assert.equal(annotated[0].urlCounts['https://github.com/openai/openai'], 2);

  assert.equal(annotated[1].displayLabel, 'Docs Example');
  assert.equal(annotated[1].cleanupScore, 16);
  assert.deepEqual(annotated[1].priorityReasons, ['最大分组：8 个标签页']);
  assert.equal(annotated[1].priorityTone, 'large');

  assert.equal(annotated[2].displayLabel, '主页分组');
  assert.equal(annotated[2].cleanupScore, 16);
  assert.deepEqual(annotated[2].priorityReasons, ['主页清理']);
  assert.equal(annotated[2].priorityTone, 'homepage');

  assert.equal(annotated[3].displayLabel, 'Local Files');
  assert.deepEqual(annotated[3].priorityReasons, ['1 个标签页已打开']);
  assert.equal(annotated[3].priorityTone, 'neutral');
});

test('annotateGroupsWithPriority preserves custom group labels', () => {
  const annotated = annotateGroupsWithPriority([
    {
      domain: 'work-docs',
      label: 'Client Work',
      tabs: [{ url: 'https://docs.example.com/spec' }],
    },
  ]);

  assert.equal(annotated[0].displayLabel, 'Client Work');
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
    '已从 GitHub 关闭 2 个重复标签页',
  );

  assert.equal(
    formatCleanupToast({ kind: 'duplicates', groupLabel: 'YouTube', closedCount: 1 }),
    '已从 YouTube 关闭 1 个重复标签页',
  );

  assert.equal(
    formatCleanupToast({ kind: 'group', groupLabel: '主页分组', closedCount: 4 }),
    '已从 主页分组 关闭 4 个标签页',
  );

  assert.equal(
    formatCleanupToast({ kind: 'group', groupLabel: 'Local Files', closedCount: 1 }),
    '已从 Local Files 关闭 1 个标签页',
  );
});
