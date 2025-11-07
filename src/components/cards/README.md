# Card Components Architecture

## Overview

Card components in the TT-Editor follow a **config-driven architecture** that eliminates code duplication through the `BaseCard` component.

## Related Documentation

This README provides an architectural overview of the card system. For detailed implementation guides:
- **Astro → React Translation:** See `/Cards.md` in project root (429 lines)
- **CodeGenerator Integration:** See `Cards.md` section "Code-Generator Integration"
- **Slot Component Usage:** See `Cards.md` section "renderPreview for Parent Cards"
- **Common Mistakes:** See `Cards.md` section "Häufige Fehler" (Common Errors)

## Architecture Pattern

### BaseCard (Core Component)
Located in `CardLayout/BaseCard.tsx` (102 LOC)

**Responsibilities:**
- Renders card preview using `config.renderPreview()`
- Generates attribute inputs dynamically from `config.attributes`
- Integrates with `NamedElementsContext` for element naming
- Handles cleanup on unmount

**Key Features:**
- ✅ Type-safe configuration via `CardConfig` interface
- ✅ Support for multiple input types (string, checkbox, function, triple_list, etc.)
- ✅ Automatic optional/required labeling
- ✅ Tooltip support
- ✅ Collapsible attributes section

### Card Components (Config Files)
Each card component is 30-40 LOC consisting of:
1. Configuration object (`CardConfig`)
2. Simple wrapper component

**Example Pattern:**
```typescript
import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const componentConfig: CardConfig = {
  defaultName: 'ComponentName',
  codegenName: 'ComponentName',
  canBeParent: false,
  attributes: [
    { name: 'attr', type: 'string', toolTip: 'Description', optional: false },
  ],
  renderPreview: (name, id) => (
    <div>Preview JSX here</div>
  )
}

export default function ComponentCard({ id }: { id: string }) {
  return <BaseCard id={id} config={componentConfig} />
}
```

## Design Decisions

### Why Config-Driven?

**Before:** Each card component had 150-200 LOC with duplicated logic for:
- State management
- Name input handling
- Attribute rendering
- Context integration

**After:**
- BaseCard: 102 LOC (single source of truth)
- Each Card: 30-40 LOC (pure configuration)
- **Result: 40% code reduction**

### What NOT to Do

❌ **Don't add card-specific logic to BaseCard**
- Keep it generic and config-driven

❌ **Don't create custom card components**
- Extend `CardConfig` if needed, don't bypass BaseCard

❌ **Don't duplicate attribute rendering**
- Use `renderInput()` in BaseCard for new input types

## Sample Cards

### SimpleInput
**Category:** Inputs
**Children:** No
**Attributes:** 13 (type, class, value, required, disabled, maxlength, pattern, etc.)
**Use Case:** Single-line text input with validation

### FinishButton
**Category:** Buttons
**Children:** No
**Attributes:** 3 (auto, queryLib, hidden)
**Use Case:** Final submission button for completing workflows

### WeiterButton
**Category:** Buttons
**Children:** No
**Attributes:** 0
**Use Case:** "Next page" navigation button

## Adding New Cards

1. Create `NewComponent.tsx` in `/cards/`
2. Define `newComponentConfig: CardConfig`
3. Export wrapper: `export default function NewComponentCard({ id }) { return <BaseCard id={id} config={newComponentConfig} /> }`
4. Add to `PaletteSubscription.ts`

## Type Definitions

### CardAttribute
```typescript
interface CardAttribute {
  name: string
  type: 'string' | 'checkbox' | 'function' | 'double_single' |
        'double_list' | 'tripple_single' | 'tripple_list' | 'tripple_submit'
  toolTip: string
  optional: boolean
}
```

### CardConfig
```typescript
interface CardConfig {
  defaultName?: string
  attributes: CardAttribute[]
  canBeParent?: boolean
  codegenName?: string
  renderPreview: (name: string, id: string, slotProps?: SlotProps) => React.ReactNode
}
```

## Testing Recommendations (TODO)

**BaseCard (Core Logic) - Recommended:**
- Unit tests for `renderInput()` switch logic
- Integration tests with NamedElementsContext
- Cleanup/unmount behavior tests

**Card Components (Configs) - Not Needed:**
- ✅ Type checking via TypeScript (compile-time)
- E2E tests for user workflows (when implemented)
- ❌ Per-card unit tests (config-only, no logic)

## Performance Considerations

- Cards use `useState` for name only
- No unnecessary re-renders (config is static)
- `renderPreview` is called on every render - keep it light
- Attributes are mapped dynamically - no performance issue for <50 attrs

## Future Improvements

- [ ] Add visual dividers in `PaletteSubscription.ts` for category grouping
- [ ] Add descriptions/tooltips for card categories
- [ ] Extract `renderInput()` to separate utility for easier extension
- [ ] Add validation support in CardConfig (min/max, regex, etc.)

## Migration Notes

If migrating from old individual card implementations:
1. Extract attribute definitions → `CardConfig.attributes`
2. Extract preview JSX → `CardConfig.renderPreview()`
3. Remove state management (BaseCard handles it)
4. Remove context hooks (BaseCard handles it)
5. Delete old 150 LOC file, replace with 35 LOC config

**Historical Note:** The codebase already implements this pattern (refactored Nov 5, 2025), saving ~1725 LOC compared to individual implementations. This architecture is already optimal and requires no further refactoring.
