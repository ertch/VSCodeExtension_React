# Input Components

## Overview

This directory contains specialized input components used by `BaseCard` for rendering card attributes.

**IMPORTANT:** Most input types DO NOT need custom components. The generic `<input type="text">` fallback is the **correct and intentional design**.

## Current Architecture (WORKING ✅)

### Implemented Components

**Input_TrippleList.tsx** (27 LOC) - The ONLY specialized input component
- **Purpose:** Dynamic list of tripples (trigger, action, target)
- **Features:** Add/remove rows with +/- buttons
- **Usage:** `type: 'tripple_list'` in card attributes
- **Why special:** Requires dynamic row management that generic text input cannot provide

### Generic Text Input Fallback (Intentional Design)

**BaseCard.tsx** uses `<input type="text">` for these types:
- `string` - Simple text input
- `function` - Function name (validated in code generation)
- `double_single` - Comma-separated pair: "value, label"
- `double_list` - Comma-separated pairs: "v1,l1 v2,l2 ..."
- `tripple_single` - Comma-separated triple: "trigger, action, target"
- `tripple_submit` - Submit-specific tripple input
- `checkbox` - Uses inline `<input type="checkbox">` (works fine)

**Why no custom components?**
1. Type information is **metadata for code generation**, not UI rendering instructions
2. Generic text input provides sufficient UX for entering comma-separated values
3. Validation/transformation happens during code generation phase, not UI layer
4. Adding wrapper components would increase complexity without user-facing benefit

## Design Decision History

### Why Empty Input Components Exist

The repository contains empty stub files:
```
Input_String.tsx        → 0 bytes (intentionally empty)
Input_Checkbox.tsx      → 0 bytes (intentionally empty)
Input_Function.tsx      → 0 bytes (intentionally empty)
Input_DoubleSingle.tsx  → 0 bytes (intentionally empty)
Input_TrippleSingle.tsx → 2 bytes (empty function stub)
```

**These were created and then ABANDONED** because:
- Initial design assumed each type needed a custom component
- During implementation, developer realized generic text input was sufficient
- Files remain as placeholders to prevent future "missing file" confusion
- **DO NOT IMPLEMENT** these components - the fallback is correct

### Evidence of Working Design

From actual usage statistics in card components:
- ✅ 62 instances of `type: 'string'` → All using text input (works)
- ✅ 4 instances of `type: 'function'` → All using text input (works)
- ✅ 3 instances of `type: 'tripple_*'` → 1 has custom component (works)
- ✅ 3 instances of `type: 'double_*'` → All using text input (works)

**Git commit `537928b`: "gen funzt"** (generation works) - No bugs reported.

## Usage Guide

### When to Create a New Input Component

Only create a specialized input component if you need:
1. **Dynamic row management** (add/remove items) - See `Input_TrippleList`
2. **Complex UI interactions** (drag-drop, nested forms, etc.)
3. **Real-time validation feedback** that can't wait for code generation
4. **Special visual representations** (color pickers, date pickers, etc.)

### When to Use Generic Text Input (Most Cases)

Use the fallback `<input type="text">` for:
- ✅ Simple string values
- ✅ Function names
- ✅ Comma-separated values
- ✅ JSON-like structures (validated later)
- ✅ Any input where typing text is sufficient

## Input Type Reference

### Type: `string`
**UI:** `<input type="text">`
**Format:** Any string
**Example:** `"Hello World"`
**Validation:** None (any text valid)

### Type: `function`
**UI:** `<input type="text">`
**Format:** Function name
**Example:** `"validateEmail"`
**Validation:** In code generator (checks function exists)

### Type: `checkbox`
**UI:** `<input type="checkbox">`
**Format:** Boolean
**Example:** checked/unchecked
**Validation:** None (boolean state)

### Type: `double_single`
**UI:** `<input type="text">`
**Format:** Comma-separated pair
**Example:** `"en, English"` or `"42, The Answer"`
**Validation:** In code generator (checks 2 values)

### Type: `double_list`
**UI:** `<input type="text">`
**Format:** Space-separated pairs
**Example:** `"en,English de,German fr,French"`
**Validation:** In code generator (checks pairs)

### Type: `tripple_single`
**UI:** `<input type="text">`
**Format:** Comma-separated triple
**Example:** `"click, show, targetElement"`
**Validation:** In code generator (checks 3 values)

### Type: `tripple_list`
**UI:** `<Input_TrippleList>` (custom component)
**Format:** Array of triples
**Example:** Multiple rows with +/- buttons
**Why special:** Dynamic row management required

### Type: `tripple_submit`
**UI:** `<input type="text">`
**Format:** Submit-specific triple
**Example:** `"submit, validate, formId"`
**Validation:** In code generator (checks submit action)

## Adding Format Hints (Recommended)

If users report confusion about input formats, add tooltips in card configs:

```typescript
{
  name: 'firstOption',
  type: 'double_single',
  toolTip: 'Format: "value, label" (e.g., "en, English")',
  optional: true
}
```

## Anti-Patterns (DO NOT DO)

❌ **Don't wrap text inputs unnecessarily:**
```typescript
// BAD - Adds complexity for zero benefit
export function Input_String({ value, onChange }: Props) {
  return <input type="text" value={value} onChange={onChange} />
}
```

❌ **Don't validate in UI layer:**
```typescript
// BAD - Validation belongs in code generation
export function Input_Function({ value }: Props) {
  const [error, setError] = useState('');
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    setError('Invalid function name');
  }
  return ...
}
```

❌ **Don't create components "for consistency":**
```typescript
// BAD - Generic input already exists in BaseCard
case 'string':
  return <Input_String name={attr.name} />  // Just use <input type="text">
```

## Testing Strategy

### Input_TrippleList (Implemented)
- ✅ Test add/remove row functionality
- ✅ Test proper name generation for inputs
- ✅ Test +/- button visibility

### Generic Text Inputs (Fallback)
- ✅ Type checking via TypeScript (compile-time)
- ✅ Format validation in code generator (runtime)
- ❌ NOT needed: UI-level input tests

## Migration Notes

If you find empty `Input_*.tsx` files in the original codebase:
1. **DO NOT implement them** - they're intentionally empty
2. **DO NOT delete them** - they serve as documentation
3. **DO reference this README** to explain the design decision

## Philosophy

> **"The best code is no code."**
>
> Each input component is maintenance burden. Only create them when generic text input is insufficient. In this codebase, that means Input_TrippleList only.

## Related Documentation

- **BaseCard Usage:** See `/src/components/cards/README.md`
- **Card Configs:** See sample cards in `/src/components/cards/`
- **Code Generator:** See `/Cards.md` for validation/transformation details
