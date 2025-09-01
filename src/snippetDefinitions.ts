import { kMaxLength } from "buffer";

// Snippet definitions with attributes structure for Astro components
export const snippetDefinitions = {
    'Layout': {
        attributes: { 
            campaignNr: {value: '', type: 'text', requierd: true}, 
            campaignTitle: {value: '', type: 'text', requierd: true},
            jsFiles: {value: '', type: 'text', requierd: true}, 
            header_imgs: {value: '', type: 'text', requierd: true}, 
            header_title: {value: '', type: 'text', requierd: true}, 
            pattern: {value: '', type: 'text', requierd: true},
            query: {value: '', type: 'text', requierd: true},
        },
        canBeParent: true,
        childs: {}
    },
    'NavTabs': {
        attributes: {value: '', type: 'textarea', requierd: true},
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
            id: {value: '', type: 'text', requierd: false},
            tab: {value: '', type: 'text', requierd: true}, 
            isVisible: {value: '', type: 'checkbox', requierd: false}, 
        },
        canBeParent: true,
        childs: {}
    },
    'Field': {
        attributes: { 
            id: {value: '', type: 'text', requierd: false}, 
            legend: {value: '', type: 'text', requierd: true}, 
            klasse: {value: '', type: 'text', requierd: false},
            group: {value: '', type: 'text', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false}, 
        },
        canBeParent: true,
        childs: {}
    },
    'Input': {
        attributes: { 
            id:     {value: '', type: 'text', requierd: true}, 
            label:  {value: '', type: 'text', requierd: false}, 
            call:   {value: '', type: 'text', requierd: false},
            type: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            value: {value: '', type: 'text', requierd: false},
            maxlength: {value: '', type: 'text', requierd: false},
            regex: {value: '', type: 'text', requierd: false},
            preset: {value: '', type: 'text', requierd: false},
            blur: {value: '', type: 'text', requierd: false},
            submitTo: {value: '', type: 'text', requierd: false},
            validate: {value: '', type: 'text', requierd: true}, 
            min: {value: '', type: 'text', requierd: false},
            max: {value: '', type: 'text', requierd: false},
            oc: {value: '', type: 'text', requierd: false},
            required: {value: '', type: 'checkbox', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
            disabled: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: false,
        childs: {}
    },
    'Select': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true},
            label: {value: '', type: 'text', requierd: true},
            options: {value: '', type: 'textarea', requierd: false},
            actions: {value: '', type: 'textarea', requierd: false},
            firstOption: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            requiredValue: {value: '', type: 'text', requierd: false},
            preset: {value: '', type: 'text', requierd: false},
            call: {value: '', type: 'text', requierd: false},
            submitTo: {value: '', type: 'text', requierd: false},
            required: {value: '', type: 'checkbox', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
            disabled: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: false,
        childs: {}
    },
    'Gatekeeper': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true},
            label: {value: '', type: 'text', requierd: true},
            options: {value: '', type: 'textarea', requierd: false},
            actions: {value: '', type: 'textarea', requierd: false},
            gate: {value: '', type: 'text', requierd: false},
            preset: {value: '', type: 'text', requierd: false},
            submitTo: {value: '', type: 'text', requierd: false},
            firstOption: {value: '', type: 'text', requierd: false},
            call: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            required: {value: '', type: 'checkbox', requierd: false},
            pageLock: {value: '', type: 'checkbox', requierd: false},
            disabled: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: false,
        childs: {}
    },
    'Gate': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true}, 
            grp: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: true,
        childs: {}
    },
    'GateGroup': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true}, 
            group: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: true,
        childs: {}
    },
    'SQL_Select': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true}, 
            label: {value: '', type: 'text', requierd: true}, 
            load: {value: '', type: 'text', requierd: true}, 
            trigger: {value: '', type: 'textarea', requierd: false}, 
            requiredValue: {value: '', type: 'text', requierd: false}, 
            call: {value: '', type: 'text', requierd: false}, 
            preset: {value: '', type: 'text', requierd: false}, 
            submitTo: {value: '', type: 'text', requierd: false}, 
            required: {value: '', type: 'checkbox', requierd: false},   
        },
        canBeParent: false,
        childs: {}
    },
    'Suggestion': {
        attributes: { 
            
            
            id: {value: '', type: 'text', requierd: true}, 
            label: {value: '', type: 'text', requierd: true}, 
            options: {value: '', type: 'textarea', requierd: true}, 
            gatekeeper: {value: '', type: 'checkbox', requierd: false}, 
            actions: {value: '', type: 'textarea', requierd: false},
            type: {value: '', type: 'text', requierd: false},
            gate: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            maxlength: {value: '', type: 'text', requierd: false},
            pattern: {value: '', type: 'text', requierd: false},
            preset: {value: '', type: 'text', requierd: false},
            submitTo: {value: '', type: 'text', requierd: false},
            inject: {value: '', type: 'text', requierd: false},
            validate: {value: '', type: 'text', requierd: false},
            value: {value: '', type: 'text', requierd: false},
            required: {value: '', type: 'checkbox', requierd: false}, 
            hidden:{value: '', type: 'checkbox', requierd: false}, 
            disabled: {value: '', type: 'checkbox', requierd: false}, 
        },
        canBeParent: false,
        childs: {}
    },
    'textField': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true},
            label: {value: '', type: 'text', requierd: true},
            row: {value: '', type: 'text', requierd: true},
            col: {value: '', type: 'text', requierd: true},
            call: {value: '', type: 'text', requierd: false},
            value: {value: '', type: 'text', requierd: false},
            MaxLength: {value: '', type: 'text', requierd: false},
            submitTo: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            validate: {value: '', type: 'text', requierd: false},
            required: {value: '', type: 'checkbox', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
        },
        canBeParent: false,
        childs: {}
    },
    'ConBlock': {
        attributes: { 
            id: {value: '', type: 'text', requierd: false},
            If: {value: '', type: 'textarea', requierd: true},
            group: {value: '', type: 'text', requierd: false},
            klasse: {value: '', type: 'text', requierd: false},
            required:{value: '', type: 'checkbox', requierd: false}, 
            hidden:{value: '', type: 'checkbox', requierd: false}, 
            setPosSale: {value: '', type: 'checkbox', requierd: false}, 
        },
        canBeParent: true,
        childs: {}
    },
    'RecordBtn': {
        attributes: { 
            id: {value: '', type: 'text', requierd: true},
            showInfo: {value: '', type: 'checkbox', requierd: false},
            centered: {value: '', type: 'checkbox', requierd: false},
            txt_info: {value: '', type: 'text', requierd: false},
            txt_btn: {value: '', type: 'text', requierd: false},
            callState: {value: '', type: 'text', requierd: false},
        },
        canBeParent: false,
        childs: {}
    },
    'FinishBtn': {
        attributes: { 
            auto: {value: '', type: 'checkbox', requierd: false},
            queryLib: {value: '', type: 'checkbox', requierd: false},
            hidden: {value: '', type: 'checkbox', requierd: false},
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