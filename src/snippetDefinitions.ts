// Snippet definitions with attributes structure for Astro components

// Common attribute types for reuse
type AttributeType = 'text' | 'textarea' | 'checkbox';

interface AttributeDefinition {
    value: string;
    type: AttributeType;
    required: boolean;
}

interface ComponentDefinition {
    attributes: Record<string, AttributeDefinition>;
    canBeParent: boolean;
    childs: Record<string, any>;
}

// Common attribute factory functions
const attr = (type: AttributeType = 'text', required = false): AttributeDefinition => ({
    value: '', type, required
});

const requiredAttr = (type: AttributeType = 'text'): AttributeDefinition => attr(type, true);

// Common attribute sets
const commonAttrs = {
    id: requiredAttr(),
    label: requiredAttr(),
    klasse: attr(),
    required: attr('checkbox'),
    hidden: attr('checkbox'),
    disabled: attr('checkbox'),
    preset: attr(),
    call: attr(),
    submitTo: attr(),
    group: attr()
};

export const snippetDefinitions: Record<string, ComponentDefinition> = {
    'Layout': {
        attributes: {
            campaignNr: requiredAttr(),
            campaignTitle: requiredAttr(),
            jsFiles: requiredAttr(),
            header_imgs: requiredAttr(),
            header_title: requiredAttr(),
            pattern: requiredAttr(),
            query: requiredAttr()
        },
        canBeParent: true,
        childs: {}
    },
    'NavTabs': {
        attributes: {
            tabs: requiredAttr('textarea')
        },
        canBeParent: false,
        childs: {}
    },
    'TabWrapper': {
        attributes: {},
        canBeParent: true,
        childs: {}
    },
    'TabPage': {
        attributes: {
            ...commonAttrs,
            id: attr(), // Override to make optional
            tab: requiredAttr(),
            isVisible: attr('checkbox')
        },
        canBeParent: true,
        childs: {}
    },
    'Field': {
        attributes: {
            ...commonAttrs,
            id: attr(), // Override to make optional
            legend: requiredAttr()
        },
        canBeParent: true,
        childs: {}
    },
    'Input': {
        attributes: {
            ...commonAttrs,
            type: attr(),
            value: attr(),
            maxlength: attr(),
            regex: attr(),
            blur: attr(),
            validate: requiredAttr(),
            min: attr(),
            max: attr(),
            oc: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'Select': {
        attributes: {
            ...commonAttrs,
            options: attr('textarea'),
            actions: attr('textarea'),
            firstOption: attr(),
            requiredValue: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'Gatekeeper': {
        attributes: {
            ...commonAttrs,
            options: attr('textarea'),
            actions: attr('textarea'),
            gate: attr(),
            firstOption: attr(),
            pageLock: attr('checkbox')
        },
        canBeParent: false,
        childs: {}
    },
    'Gate': {
        attributes: {
            ...commonAttrs,
            grp: attr()
        },
        canBeParent: true,
        childs: {}
    },
    'GateGroup': {
        attributes: {
            ...commonAttrs
        },
        canBeParent: true,
        childs: {}
    },
    'SQL_Select': {
        attributes: {
            ...commonAttrs,
            load: requiredAttr(),
            trigger: attr('textarea'),
            requiredValue: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'Suggestion': {
        attributes: {
            ...commonAttrs,
            options: requiredAttr('textarea'),
            gatekeeper: attr('checkbox'),
            actions: attr('textarea'),
            type: attr(),
            gate: attr(),
            maxlength: attr(),
            pattern: attr(),
            inject: attr(),
            validate: attr(),
            value: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'textField': {
        attributes: {
            ...commonAttrs,
            row: requiredAttr(),
            col: requiredAttr(),
            value: attr(),
            MaxLength: attr(),
            validate: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'ConBlock': {
        attributes: {
            ...commonAttrs,
            id: attr(), // Override to make optional
            If: requiredAttr('textarea'),
            setPosSale: attr('checkbox')
        },
        canBeParent: true,
        childs: {}
    },
    'RecordBtn': {
        attributes: {
            id: requiredAttr(),
            showInfo: attr('checkbox'),
            centered: attr('checkbox'),
            txt_info: attr(),
            txt_btn: attr(),
            callState: attr()
        },
        canBeParent: false,
        childs: {}
    },
    'FinishBtn': {
        attributes: {
            auto: attr('checkbox'),
            queryLib: attr('checkbox'),
            hidden: attr('checkbox')
        },
        canBeParent: false,
        childs: {}
    },
    'NextPageBtn': {
        attributes: {},
        canBeParent: false,
        childs: {}
    }
};

// Static config block (always present in Astro files)
export const staticConfigBlock = `
<div style="border: 2px solid #333; padding: 12px; margin: 10px 0; background: #f5f5f5; border-radius: 8px;">
    <h3 style="margin-top: 0;">Static Config Block</h3>
    <div style="font-size: 12px; color: #666;">
        <div><strong>Layout</strong> → NavTabs → TabWrapper</div>
        <div>Diese Struktur ist immer vorhanden</div>
    </div>
</div>
`;