// Snippet definitions with attributes structure for Astro components
export const snippetDefinitions = {
    'Layout': {
        attributes: { 
            campaignNr: '', 
            campaignTitle: '', 
            jsFiles: '', 
            header_imgs: '', 
            header_title: '', 
            pattern: '', 
            query: '' 
        },
        childs: {}
    },
    'NavTabs': {
        attributes: { tabs: '' },
        childs: {}
    },
    'TabWrapper': {
        attributes: {},
        childs: {}
    },
    'TabPage': {
        attributes: { 
            id: '', 
            tab: '', 
            isVisible: '' 
        },
        childs: {}
    },
    'Field': {
        attributes: { 
            id: '', 
            legend: '', 
            klasse: '' 
        },
        childs: {}
    },
    'Input': {
        attributes: { 
            id: '', 
            label: '', 
            type: '', 
            validate: '', 
            blur: '', 
            preset: '', 
            required: '' 
        },
        childs: {}
    },
    'Select': {
        attributes: { 
            id: '', 
            label: '', 
            call: '', 
            firstOption: '', 
            options: '' 
        },
        childs: {}
    },
    'Gatekeeper': {
        attributes: { 
            id: '', 
            label: '', 
            options: '', 
            actions: '', 
            gate: '', 
            submitTo: '', 
            pageLock: '', 
            required: '', 
            firstOption: '' 
        },
        childs: {}
    },
    'Gate': {
        attributes: { 
            id: '', 
            klasse: '' 
        },
        childs: {}
    },
    'GateGroup': {
        attributes: { 
            id: '', 
            klasse: '', 
            group: '' 
        },
        childs: {}
    },
    'SQL_Select': {
        attributes: { 
            id: '', 
            label: '', 
            call: '', 
            load: '', 
            required: '' 
        },
        childs: {}
    },
    'Suggestion': {
        attributes: { 
            id: '', 
            label: '', 
            options: '', 
            actions: '', 
            type: '', 
            validate: '', 
            gatekeeper: '', 
            gate: '', 
            submitTo: '' 
        },
        childs: {}
    },
    'ConBlock': {
        attributes: { 
            id: '', 
            klasse: '', 
            group: '', 
            If: '', 
            setPosSale: '' 
        },
        childs: {}
    },
    'RecordBtn': {
        attributes: { 
            id: '', 
            callState: '', 
            showInfo: '', 
            txt_info: '', 
            txt_btn: '' 
        },
        childs: {}
    },
    'FinishBtn': {
        attributes: { 
            auto: '' 
        },
        childs: {}
    },
    'NextPageBtn': {
        attributes: {},
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