import { describe, expect, it } from 'vitest';
import {
  ROOT_KEYS,
  buildNavItems,
  findOpenPath,
  getBreadcrumbTrail,
  getSearchablePages,
  getSelectedKey,
} from './navConfig';
import { ROLES } from '@/context/auth-context';

/** Stand in for i18next: returns the key so assertions stay readable. */
const t = (key) => key;

describe('getSelectedKey', () => {
  it('matches an exact route', () => {
    expect(getSelectedKey('/dashboard/pmo')).toBe('/dashboard/pmo');
  });

  it('ignores a trailing slash', () => {
    expect(getSelectedKey('/dashboard/pmo/')).toBe('/dashboard/pmo');
  });

  it('matches the longest prefix, not the last path segment', () => {
    // The old split('/').pop() implementation returned '404' here, which
    // matched nothing, and '/dashboard/errors/404' has to win over '/dashboard'.
    expect(getSelectedKey('/dashboard/errors/404')).toBe('/dashboard/errors/404');
  });

  it('matches a nested child route to its parent page', () => {
    expect(getSelectedKey('/dashboard/pmo/some-detail')).toBe('/dashboard/pmo');
  });

  it('returns undefined for a route outside the tree', () => {
    expect(getSelectedKey('/nope')).toBeUndefined();
  });
});

describe('findOpenPath', () => {
  it('returns the owning group for a leaf', () => {
    // /dashboard/portfolios lives in the pmo-group
    expect(findOpenPath('/dashboard/portfolios')).toEqual(['pmo-group']);
  });

  it('returns null for an unknown key', () => {
    expect(findOpenPath('/dashboard/nope')).toBeNull();
  });

  it('only ever returns keys that are real open keys', () => {
    const path = findOpenPath('/dashboard/notifications');
    path.forEach((key) => expect(ROOT_KEYS).toContain(key));
  });
});

describe('buildNavItems role filtering', () => {
  const labelsOf = (items) =>
    items.flatMap((section) =>
      section.children.flatMap((group) => group.children.map((c) => c.key))
    );

  it('shows all PMO pages to any role', () => {
    // PMO nav has no role-restricted pages; every item is visible regardless of role
    const items = buildNavItems(t, { hasRole: (roles) => !roles || roles.includes(ROLES.ADMIN) });
    expect(labelsOf(items)).toContain('/dashboard/pmo');
  });

  it('hides no pages from an editor (PMO nav has no role restrictions)', () => {
    const itemsAdmin = buildNavItems(t, {
      hasRole: (roles) => !roles || roles.includes(ROLES.ADMIN),
    });
    const itemsEditor = buildNavItems(t, {
      hasRole: (roles) => !roles || roles.includes(ROLES.EDITOR),
    });
    // Both roles see the same items since no page in the PMO nav has a roles guard
    expect(labelsOf(itemsEditor)).toEqual(labelsOf(itemsAdmin));
  });

  it('keeps every unrestricted page visible to an editor', () => {
    const items = buildNavItems(t, { hasRole: (roles) => !roles || roles.includes(ROLES.EDITOR) });
    expect(labelsOf(items)).toContain('/dashboard/pmo');
  });
});

describe('getBreadcrumbTrail', () => {
  it('builds section, group, then page', () => {
    const trail = getBreadcrumbTrail('/dashboard/pmo', t);
    expect(trail.map((crumb) => crumb.label)).toEqual([
      'nav.sections.pmoCenter',
      'nav.groups.pmoGroup',
      'nav.items.pmo',
    ]);
  });

  it('is empty for an unknown route', () => {
    expect(getBreadcrumbTrail('/nope', t)).toEqual([]);
  });
});

describe('getSearchablePages', () => {
  it('includes external pages so the palette can open them', () => {
    const pages = getSearchablePages(t);
    expect(pages.find((page) => page.to === '/signin')?.external).toBe(true);
  });

  it('respects the role filter', () => {
    const pages = getSearchablePages(t, (roles) => !roles || roles.includes(ROLES.VIEWER));
    expect(pages.find((page) => page.to === '/dashboard/roles')).toBeUndefined();
  });
});
