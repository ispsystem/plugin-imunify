/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface AntivirusMenu {
    'url': string;
  }
  interface AntivirusMenuVmenuItem {}
}

declare global {


  interface HTMLAntivirusMenuElement extends Components.AntivirusMenu, HTMLStencilElement {}
  var HTMLAntivirusMenuElement: {
    prototype: HTMLAntivirusMenuElement;
    new (): HTMLAntivirusMenuElement;
  };

  interface HTMLAntivirusMenuVmenuItemElement extends Components.AntivirusMenuVmenuItem, HTMLStencilElement {}
  var HTMLAntivirusMenuVmenuItemElement: {
    prototype: HTMLAntivirusMenuVmenuItemElement;
    new (): HTMLAntivirusMenuVmenuItemElement;
  };
  interface HTMLElementTagNameMap {
    'antivirus-menu': HTMLAntivirusMenuElement;
    'antivirus-menu-vmenu-item': HTMLAntivirusMenuVmenuItemElement;
  }
}

declare namespace LocalJSX {
  interface AntivirusMenu extends JSXBase.HTMLAttributes<HTMLAntivirusMenuElement> {
    'url'?: string;
  }
  interface AntivirusMenuVmenuItem extends JSXBase.HTMLAttributes<HTMLAntivirusMenuVmenuItemElement> {}

  interface IntrinsicElements {
    'antivirus-menu': AntivirusMenu;
    'antivirus-menu-vmenu-item': AntivirusMenuVmenuItem;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


