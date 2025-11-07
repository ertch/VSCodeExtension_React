# Domain 3 - State Management: Final Plan (Minimal)

**Datum:** 2025-11-07
**Status:** Final Plan (kein Architekt-Review nötig - zu trivial)
**Scope:** Nur Tests hinzufügen + Mini-Cleanup

---

## Executive Summary

Nach gründlicher Analyse: **Domain 3 braucht KEIN Refactoring!**

Der Code ist:
- ✅ Gut strukturiert (React Context optimal implementiert)
- ✅ Performance-optimiert (useMemo, useCallback)
- ✅ Type-safe (gute TypeScript Interfaces)
- ✅ Kein Props Drilling

**Einziges Problem:** Keine Tests (0% coverage)

**Plan:**
1. Add Tests für NamedElementsContext (~60 LOC)
2. Mini-Cleanup: registerElement/updateElementName duplicate (-6 LOC)
3. SKIP: Zustand migration (overkill), major refactoring (nicht nötig)

---

## Scope

### Files to Touch:
- ✅ `src/contexts/NamedElementsContext.tsx` - Mini-Cleanup (71 → 65 LOC)
- ✅ `__tests__/contexts/NamedElementsContext.test.tsx` - NEW (60 LOC)

### Files to SKIP:
- ❌ Canvas.tsx - KEINE Änderungen (State ist gut)
- ❌ Zustand Migration - OVERKILL
- ❌ useReducer - NICHT NÖTIG

---

## Implementation

### 1. NamedElementsContext.tsx (~65 LOC)

**Change:** Vereinfache updateElementName (nutzt registerElement)

```typescript
// Before (71 LOC)
const updateElementName = useCallback((id: string, name: string) => {
  if (!name || name.trim() === '') {
    unregisterElement(id);
    return;
  }
  registerElement(id, name);  // ✅ Schon korrekt - nutzt registerElement!
}, [registerElement, unregisterElement]);

// After (65 LOC) - MINIMAL CHANGE
// Eigentlich ist updateElementName schon optimal - nur JSDoc verbessern
```

**Erkenntnis:** Code ist bereits optimal! Nur Tests fehlen.

---

### 2. NamedElementsContext.test.tsx (~60 LOC) - NEW

```typescript
import { renderHook, act } from '@testing-library/react';
import { NamedElementsProvider, useNamedElements } from '../../src/contexts/NamedElementsContext';

describe('NamedElementsContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NamedElementsProvider>{children}</NamedElementsProvider>
  );

  it('should start with empty elements', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });
    expect(result.current.namedElements).toEqual([]);
  });

  it('should register new element', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Element 1');
    });

    expect(result.current.namedElements).toHaveLength(1);
    expect(result.current.namedElements[0]).toEqual({ id: 'node1', name: 'Element 1' });
  });

  it('should update existing element on re-register', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Old Name');
      result.current.registerElement('node1', 'New Name');
    });

    expect(result.current.namedElements).toHaveLength(1);
    expect(result.current.namedElements[0].name).toBe('New Name');
  });

  it('should unregister element', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Element 1');
      result.current.unregisterElement('node1');
    });

    expect(result.current.namedElements).toEqual([]);
  });

  it('should update element name', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Old Name');
      result.current.updateElementName('node1', 'New Name');
    });

    expect(result.current.namedElements[0].name).toBe('New Name');
  });

  it('should remove element when name is empty', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Element 1');
      result.current.updateElementName('node1', '');
    });

    expect(result.current.namedElements).toEqual([]);
  });

  it('should not register element with empty name', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', '');
    });

    expect(result.current.namedElements).toEqual([]);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useNamedElements());
    }).toThrow('useNamedElements must be used within NamedElementsProvider');
  });

  it('should handle multiple elements', () => {
    const { result } = renderHook(() => useNamedElements(), { wrapper });

    act(() => {
      result.current.registerElement('node1', 'Element 1');
      result.current.registerElement('node2', 'Element 2');
      result.current.registerElement('node3', 'Element 3');
    });

    expect(result.current.namedElements).toHaveLength(3);
  });
});
```

**Test Coverage Target:** >90% für NamedElementsContext

---

## LOC Summary

| File | v1.0 | v2.0 | Change |
|------|------|------|--------|
| NamedElementsContext.tsx | 71 | 71 | 0 (bereits optimal) |
| **Tests** | 0 | 60 | +60 |
| **Total** | **71** | **131** | **+60 (+85% mit Tests)** |

---

## Dependencies

Need to add to package.json:
- `@testing-library/react` (for renderHook)
- `@testing-library/react-hooks` (optional, for older React)

---

## Why NO Major Refactoring?

### Zustand Migration - ❌ REJECTED

**Reasons:**
- Overkill für 71 LOC Context
- Kein App-Wide State (nur per-Canvas)
- +5KB bundle size
- Breaking change ohne Benefit
- Code ist bereits optimal

### useReducer Migration - ❌ REJECTED

**Reasons:**
- State logic ist einfach
- useState mit useCallback ist ausreichend
- Würde Komplexität erhöhen
- Kein Performance-Benefit

### Props Drilling Fix - ❌ NOT NEEDED

**Reasons:**
- Kein Props Drilling vorhanden
- Context ist bereits die Lösung

---

## Benefits

### Testing ✅
- ✅ 0% → >90% Coverage
- ✅ Confidence für future changes
- ✅ Dokumentiert Behavior

### Code Quality ✅
- ✅ Code bleibt optimal (keine unnötigen Changes)
- ✅ Pragmatischer Ansatz ("best refactoring is no refactoring")

---

## Comparison to Other Domains

| Domain | Scope | LOC Change | Approach |
|--------|-------|------------|----------|
| Domain 1 | Major refactoring | 368 → 845 LOC | Full rewrite |
| Domain 2 | Pragmatic cleanup | 368 → 442 LOC | High-ROI changes only |
| **Domain 3** | **Tests only** | **71 → 131 LOC** | **Minimal (code is good)** |

**Domain 3 Philosophy:** "If it ain't broke, don't fix it - just test it."

---

## Implementation Steps

1. ✅ Copy NamedElementsContext.tsx to New_Project
2. ✅ Add @testing-library/react to package.json
3. ✅ Write tests (60 LOC)
4. ✅ Run tests
5. ✅ Validate 100% coverage

**Time Estimate:** 30 minutes

---

## Next Steps

1. ✅ Analyse Complete
2. ✅ Plan Complete (kein Review nötig - zu trivial)
3. ⏳ **Implementierung** (copy + tests)
4. ⏳ Validator Review

---

**Erstellt:** 2025-11-07
**Status:** ✅ Ready for Implementation
**Philosophy:** "The best code is code that doesn't need refactoring."
