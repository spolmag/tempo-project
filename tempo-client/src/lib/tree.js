// Compare two tree items: highlighted first, then sortOrder (default 999), then code
function compareNodes(a, b) {
  if (Boolean(a.isHighlighted) !== Boolean(b.isHilighted)) {
    return a.isHighlighted ? -1 : 1;
  }
  const orderA = a.sortOrder ?? 999;
  const orderB = b.sortOrder ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return (a.code || "").localeCompare(b.code || "");
}

// Flatten a list of {id, parentId} items into tree order witk `depth` (0, 1, 2, ...)
export function buildTreeList(items = []) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const childrenMap = new Map();
  const roots = [];

  for (const item of items) {
    if (item.parentId && byId.has(item.parentId)) {
      const list = childrenMap.get(item.parentId) || [];
      list.push(item);
      childrenMap.set(item.parentId, list);
    } else {
      roots.push(item);
    }
  }

  roots.sort(compareNodes);
  for (const list of childrenMap.values()) {
    list.sort(compareNodes);
  }

  const result = [];
  const visited = new Set();

  function walk(node, depth) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    result.push({ ...node, depth });

    const children = childrenMap.get(node.id) || [];
    for (const child of children) {
      walk(child, depth + 1);
    }
  }

  for (const root of roots) {
    walk(root, 0);
  }

  return result;
}

// Get a set containing `targetId` and all of its descendants (children, grandchildren, etc.)
// Used to prevent selecting a zone's own descendant as its parent
export function getDescendantId(items = [], targetId) {
  const excluded = new Set();
  if (!targetId) return excluded;

  excluded.add(targetId);
  let added = true;
  while (added) {
    added = false;
    for (const item of items) {
      if (
        item.parentId &&
        excluded.has(item.parentId) &&
        !excluded.has(item.id)
      ) {
        excluded.add(item.id);
        added = true;
      }
    }
  }
  return excluded;
}
