/**
 * NamedElementsSelect - Controlled named element selector
 *
 * Enhanced version of Select_NamedElements with controlled component pattern.
 * Supports value, onChange, placeholder, and className props for flexible usage.
 *
 * Use this when you need programmatic control over the selection.
 * Use Select_NamedElements for simple form inputs.
 */
interface NamedElementsSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}
export default function NamedElementsSelect({ value, onChange, placeholder, className, }: NamedElementsSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NamedElementsSelect.d.ts.map