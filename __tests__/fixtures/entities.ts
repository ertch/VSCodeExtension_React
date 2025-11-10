/**
 * Test Fixtures für Entity Testing
 */

import { TabPageEntity, StandardEntity } from '../../src/generator/types';

export const TEST_ENTITIES = {
  tabPage: {
    type: 'TabPage',
    name: 'TestTab',
    tabIndex: 1
  } as TabPageEntity,

  simpleEntity: {
    type: 'Button',
    inputs: {
      name: 'btn1',
      class: 'primary',
      disabled: false,
      hidden: false
    }
  },

  nestedEntity: {
    type: 'Container',
    inputs: { name: 'root', class: 'container' },
    children: [
      {
        type: 'Button',
        inputs: { name: 'child1', class: 'btn' }
      },
      {
        type: 'Input',
        inputs: { name: 'child2', type: 'text', required: true }
      }
    ]
  },

  entityWithActions: {
    type: 'SimpleSelect',
    inputs: {
      name: 'mySelect',
      options: [['val1', 'Label 1'], ['val2', 'Label 2']],
      actions_trigger_0: 'val1',
      actions_action_0: 'show',
      actions_target_id_0: 'target1',
      actions_trigger_1: 'val2',
      actions_action_1: 'hide',
      actions_target_id_1: 'target2'
    }
  },

  complexEntity: {
    type: 'GatekeeperSelect',
    inputs: {
      name: 'gatekeeper',
      options: [['opt1', 'Option 1'], ['opt2', 'Option 2']],
      firstOption: 'default,Default Option',
      required: true,
      'data-gate': 'gate1',
      'data-lock': true
    }
  },

  tabPageWithChildren: {
    type: 'TabPage',
    name: 'TestTab',
    tabIndex: 1,
    children: [
      {
        type: 'Gate',
        inputs: { name: 'gate1', class: 'primary' },
        children: [
          {
            type: 'Button',
            inputs: { name: 'btn1', label: 'Click Me' },
            children: []
          } as StandardEntity
        ]
      } as StandardEntity,
      {
        type: 'InfoText',
        inputs: { name: 'info1', text: 'Test Info' },
        children: []
      } as StandardEntity
    ]
  } as TabPageEntity,

  emptyTabPage: {
    type: 'TabPage',
    name: 'Empty',
    tabIndex: 0,
    children: []
  } as TabPageEntity,

  invalidEntity: {
    type: '',
    inputs: {}
  }
};
