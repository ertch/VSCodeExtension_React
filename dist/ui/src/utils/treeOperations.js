"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttribute = exports.moveNode = exports.wouldCreateCycle = exports.insertAt = exports.removeById = exports.findParentAndIndex = exports.containsId = exports.findById = void 0;
/**
 * Finds a component by ID in the tree structure
 */
const findById = (nodes, id) => {
    for (const n of nodes) {
        if (n.id === id)
            return n;
        const found = (0, exports.findById)(n.children, id);
        if (found)
            return found;
    }
    return null;
};
exports.findById = findById;
/**
 * Checks if a node contains a specific ID in its subtree
 */
const containsId = (node, targetId) => {
    if (node.id === targetId)
        return true;
    for (const c of node.children) {
        if ((0, exports.containsId)(c, targetId))
            return true;
    }
    return false;
};
exports.containsId = containsId;
/**
 * Finds the parent ID and index of a specific node
 * Returns parentId (null = Root) + Index of the node
 */
const findParentAndIndex = (nodes, id, parentId = null) => {
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.id === id)
            return { parentId, index: i };
        const sub = (0, exports.findParentAndIndex)(n.children, id, n.id);
        if (sub)
            return sub;
    }
    return null;
};
exports.findParentAndIndex = findParentAndIndex;
/**
 * Removes a node by ID and returns the new tree + removed node
 */
const removeById = (nodes, id) => {
    const next = [];
    let removed = null;
    for (const n of nodes) {
        if (n.id === id) {
            removed = n;
            continue;
        }
        const res = (0, exports.removeById)(n.children, id);
        if (res.removed && !removed)
            removed = res.removed;
        next.push(Object.assign(Object.assign({}, n), { children: res.nodes }));
    }
    return { nodes: next, removed };
};
exports.removeById = removeById;
/**
 * Inserts a child at a specific position
 * parentId null -> Root level
 */
const insertAt = (nodes, parentId, index, child) => {
    if (parentId === null) {
        const i = Math.max(0, Math.min(index, nodes.length));
        return [...nodes.slice(0, i), child, ...nodes.slice(i)];
    }
    return nodes.map(n => n.id === parentId
        ? Object.assign(Object.assign({}, n), { children: [
                ...n.children.slice(0, Math.max(0, Math.min(index, n.children.length))),
                child,
                ...n.children.slice(Math.max(0, Math.min(index, n.children.length))),
            ] }) : Object.assign(Object.assign({}, n), { children: (0, exports.insertAt)(n.children, parentId, index, child) }));
};
exports.insertAt = insertAt;
/**
 * Checks if moving a source to target would create a cycle
 */
const wouldCreateCycle = (nodes, sourceId, targetId) => {
    if (targetId === 'ROOT')
        return false;
    const sourceNode = (0, exports.findById)(nodes, sourceId);
    if (!sourceNode)
        return false;
    return (0, exports.containsId)(sourceNode, targetId);
};
exports.wouldCreateCycle = wouldCreateCycle;
/**
 * Atomic move operation: Only applies if source + target are valid
 */
const moveNode = (nodes, sourceId, drop, componentsLength) => {
    if (!drop)
        return nodes;
    if (drop.targetId !== 'ROOT' && sourceId === drop.targetId)
        return nodes;
    if ((0, exports.wouldCreateCycle)(nodes, sourceId, drop.targetId))
        return nodes;
    const srcInfo = (0, exports.findParentAndIndex)(nodes, sourceId);
    if (!srcInfo)
        return nodes;
    let destParentId;
    let destIndex;
    if (drop.targetId === 'ROOT') {
        destParentId = null;
        destIndex = drop.position === 'before' ? 0 : componentsLength;
    }
    else {
        const target = (0, exports.findById)(nodes, drop.targetId);
        if (!target)
            return nodes;
        if (drop.position === 'inside') {
            destParentId = target.id;
            destIndex = target.children.length;
        }
        else {
            const tInfo = (0, exports.findParentAndIndex)(nodes, target.id);
            if (!tInfo)
                return nodes;
            destParentId = tInfo.parentId;
            destIndex = tInfo.index + (drop.position === 'after' ? 1 : 0);
            // Reordering im selben Parent korrigieren (Index verschiebt sich nach Remove)
            if (destParentId === srcInfo.parentId && srcInfo.index < destIndex) {
                destIndex -= 1;
            }
        }
    }
    // Entfernen + Einfügen (Rollback bei Problemen)
    const { nodes: without, removed } = (0, exports.removeById)(nodes, sourceId);
    if (!removed)
        return nodes;
    // Extra-Schutz: nicht in eigenen (jetzt entfernten) Subtree einfügen
    if (drop.targetId !== 'ROOT') {
        // Wenn Ziel unterhalb der entfernten Quelle lag, existiert es nach removeById nicht mehr
        const targetStillExists = !!(0, exports.findById)(drop.position === 'inside' ? without : without, // gleicher Baum
        drop.targetId);
        if (!targetStillExists && drop.targetId !== 'ROOT') {
            return nodes; // Rollback
        }
    }
    return (0, exports.insertAt)(without, destParentId, destIndex, removed);
};
exports.moveNode = moveNode;
/**
 * Updates an attribute for a specific component
 */
const updateAttribute = (nodes, id, key, value) => {
    const update = (nodeList) => nodeList.map(n => n.id === id
        ? Object.assign(Object.assign({}, n), { attributes: Object.assign(Object.assign({}, n.attributes), { [key]: value }) }) : Object.assign(Object.assign({}, n), { children: update(n.children) }));
    return update(nodes);
};
exports.updateAttribute = updateAttribute;
