/**
 * Type Definitions für Code Generator
 */
export interface BaseEntity {
    id?: string;
    type: string;
    children?: Entity[];
}
export interface TabPageEntity {
    id?: string;
    type: 'TabPage';
    name: string;
    tabIndex: number;
}
export type InputValue = string | number | boolean | InputValue[];
export interface EntityInputs {
    name?: string;
    [key: string]: InputValue | undefined;
}
export interface StandardEntity {
    id?: string;
    type: string;
    inputs: EntityInputs;
    children?: Entity[];
}
export type Entity = TabPageEntity | StandardEntity;
export interface GenerateHTMLResult {
    tabs: string[][];
    components: string[];
    html: string;
}
export interface WrapperConfig {
    before?: (entity: Entity) => string;
    after?: (entity: Entity) => string;
    wrapAll?: (html: string) => string;
}
export interface GenerateOptions {
    wrapperConfig?: WrapperConfig;
    validate?: boolean;
}
//# sourceMappingURL=types.d.ts.map