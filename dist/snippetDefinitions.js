"use strict";
// Snippet definitions with attributes structure for Astro components
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticConfigBlock = exports.snippetDefinitions = void 0;
// Common attribute factory functions
const attr = (type = 'text', required = false) => ({
    value: '', type, required
});
const requiredAttr = (type = 'text') => attr(type, true);
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
exports.snippetDefinitions = {
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
        attributes: Object.assign(Object.assign({}, commonAttrs), { id: attr(), tab: requiredAttr(), isVisible: attr('checkbox') }),
        canBeParent: true,
        childs: {}
    },
    'Field': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { id: attr(), legend: requiredAttr() }),
        canBeParent: true,
        childs: {}
    },
    'Input': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { type: attr(), value: attr(), maxlength: attr(), regex: attr(), blur: attr(), validate: requiredAttr(), min: attr(), max: attr(), oc: attr() }),
        canBeParent: false,
        childs: {}
    },
    'Select': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { options: attr('textarea'), actions: attr('textarea'), firstOption: attr(), requiredValue: attr() }),
        canBeParent: false,
        childs: {}
    },
    'Gatekeeper': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { options: attr('textarea'), actions: attr('textarea'), gate: attr(), firstOption: attr(), pageLock: attr('checkbox') }),
        canBeParent: false,
        childs: {}
    },
    'Gate': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { grp: attr() }),
        canBeParent: true,
        childs: {}
    },
    'GateGroup': {
        attributes: Object.assign({}, commonAttrs),
        canBeParent: true,
        childs: {}
    },
    'SQL_Select': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { load: requiredAttr(), trigger: attr('textarea'), requiredValue: attr() }),
        canBeParent: false,
        childs: {}
    },
    'Suggestion': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { options: requiredAttr('textarea'), gatekeeper: attr('checkbox'), actions: attr('textarea'), type: attr(), gate: attr(), maxlength: attr(), pattern: attr(), inject: attr(), validate: attr(), value: attr() }),
        canBeParent: false,
        childs: {}
    },
    'textField': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { row: requiredAttr(), col: requiredAttr(), value: attr(), MaxLength: attr(), validate: attr() }),
        canBeParent: false,
        childs: {}
    },
    'ConBlock': {
        attributes: Object.assign(Object.assign({}, commonAttrs), { id: attr(), If: requiredAttr('textarea'), setPosSale: attr('checkbox') }),
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
exports.staticConfigBlock = `
<div style="border: 2px solid #333; padding: 12px; margin: 10px 0; background: #f5f5f5; border-radius: 8px;">
    <h3 style="margin-top: 0;">Static Config Block</h3>
    <div style="font-size: 12px; color: #666;">
        <div><strong>Layout</strong> → NavTabs → TabWrapper</div>
        <div>Diese Struktur ist immer vorhanden</div>
    </div>
</div>
`;
