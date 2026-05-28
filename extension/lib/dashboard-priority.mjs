export const HOMEPAGE_DOMAIN = '__landing-pages__';

export const KNOWN_LABELS = {
  'github.com': 'GitHub',
  'www.github.com': 'GitHub',
  'youtube.com': 'YouTube',
  'www.youtube.com': 'YouTube',
  'local-files': 'Local Files',
};

export function countUrls(tabs = []) {
  const counts = {};

  for (const tab of tabs) {
    const url = tab?.url;
    if (!url) continue;
    counts[url] = (counts[url] || 0) + 1;
  }

  return counts;
}

export function friendlyGroupLabel(group = {}) {
  const domain = group?.domain || '';

  if (domain === HOMEPAGE_DOMAIN) return 'Homepages';
  if (KNOWN_LABELS[domain]) return KNOWN_LABELS[domain];

  const clean = domain
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|dev|app|ai|co)$/, '')
    .split('.')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return clean || 'Unknown';
}

export function buildPriorityReasons(group = {}, largestTabCount = 0) {
  const reasons = [];
  const tabCount = group?.tabCount || 0;
  const duplicateExtraCount = group?.duplicateExtraCount || 0;
  const isHomepageGroup = group?.isHomepageGroup || false;

  if (duplicateExtraCount > 0) {
    reasons.push(`${duplicateExtraCount} duplicate tab${duplicateExtraCount === 1 ? '' : 's'}`);
  }

  if (isHomepageGroup) {
    reasons.push('Homepage cleanup');
  }

  if (tabCount >= 8 && tabCount === largestTabCount) {
    reasons.push(`Largest group: ${tabCount} tabs`);
  } else if (reasons.length === 0 || duplicateExtraCount > 0 || isHomepageGroup) {
    reasons.push(`${tabCount} tab${tabCount === 1 ? '' : 's'} open`);
  }

  return reasons;
}

export function buildPriorityTone(group = {}) {
  if ((group?.duplicateExtraCount || 0) > 0) return 'duplicate';
  if (group?.isHomepageGroup) return 'homepage';
  if ((group?.tabCount || 0) >= 8) return 'large';
  return 'neutral';
}

export function annotateGroupsWithPriority(groups = []) {
  const tabCounts = groups.map(group => group?.tabs?.length || 0);
  const largestTabCount = tabCounts.length ? Math.max(...tabCounts) : 0;

  return groups
    .map((group, index) => {
      const tabs = group?.tabs || [];
      const urlCounts = countUrls(tabs);
      const duplicateExtraCount = Object.values(urlCounts).reduce(
        (sum, count) => sum + Math.max(count - 1, 0),
        0,
      );
      const tabCount = tabs.length;
      const isHomepageGroup = group?.domain === HOMEPAGE_DOMAIN;
      const cleanupScore =
        duplicateExtraCount * 20 +
        Math.min(tabCount, 20) * 2 +
        (isHomepageGroup ? 12 : 0);

      const annotated = {
        ...group,
        label: friendlyGroupLabel(group),
        tabCount,
        duplicateExtraCount,
        isHomepageGroup,
        cleanupScore,
      };

      return {
        ...annotated,
        priorityReasons: buildPriorityReasons(annotated, largestTabCount),
        priorityTone: buildPriorityTone(annotated),
        originalIndex: index,
      };
    })
    .sort((left, right) => {
      if (right.cleanupScore !== left.cleanupScore) {
        return right.cleanupScore - left.cleanupScore;
      }

      if (right.tabCount !== left.tabCount) {
        return right.tabCount - left.tabCount;
      }

      return left.originalIndex - right.originalIndex;
    })
    .map(({ originalIndex, ...group }) => group);
}

export function buildHealthSummary(groups = [], openTabs = 0) {
  const annotated = annotateGroupsWithPriority(groups);
  const duplicateExtras = annotated.reduce(
    (sum, group) => sum + (group.duplicateExtraCount || 0),
    0,
  );
  const homepageGroup = annotated.find(group => group.isHomepageGroup);
  const biggestGroup = annotated.reduce((biggest, group) => {
    if (!biggest || group.tabCount > biggest.tabCount) return group;
    return biggest;
  }, null);

  return {
    openTabs,
    duplicateExtras,
    homepageCount: homepageGroup?.tabCount || 0,
    biggestGroup: biggestGroup
      ? {
          label: biggestGroup.label,
          tabCount: biggestGroup.tabCount,
        }
      : null,
  };
}

export function formatCleanupToast({ kind, groupLabel, closedCount }) {
  const count = closedCount || 0;
  const duplicateLabel = `duplicate tab${count === 1 ? '' : 's'}`;
  const tabLabel = `tab${count === 1 ? '' : 's'}`;

  if (kind === 'duplicates') {
    return `Closed ${count} ${duplicateLabel} in ${groupLabel}`;
  }

  return `Closed ${count} ${tabLabel} from ${groupLabel}`;
}
