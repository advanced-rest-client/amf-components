import { ContextMenuCommand } from '@api-client/context-menu';
import ApiNavigationElement from '../elements/ApiNavigationElement.js';


const commands: ContextMenuCommand[] = [
  {
    target: 'all',
    label: 'Expand all',
    execute: (ctx) => {
      const menu = ctx.root as ApiNavigationElement;
      menu.expandAll();
    },
  },
  {
    target: 'all',
    label: 'Collapse all',
    execute: (ctx) => {
      const menu = ctx.root as ApiNavigationElement;
      menu.collapseAll();
    },
  },
  {
    target: 'endpoints',
    label: 'Expand all endpoints',
    execute: (ctx) => {
      const menu = ctx.root as ApiNavigationElement;
      menu.expandAllEndpoints();
    },
  },
  {
    target: 'endpoints',
    label: 'Collapse all endpoints',
    execute: (ctx) => {
      const menu = ctx.root as ApiNavigationElement;
      menu.collapseAllEndpoints();
    },
  },
];
export default commands;
