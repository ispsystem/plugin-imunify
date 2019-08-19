/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  Observable,
} from 'rxjs';
import {
  languageTypes,
} from './constants';

export namespace Components {
  interface AntivirusMenu {
    /**
    * Observable of icons only menu
    */
    'iconsOnly$': Observable<boolean>;
    /**
    * Observable of application router
    */
    'routerChangeEvent': Observable<any>;
    /**
    * Observable of translate service
    */
    'translateService': { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
    /**
    * Antivirus card plugin url
    */
    'url': string;
  }
  interface AntivirusMenuVmenuItem {
    /**
    * Flag for active status
    */
    'active': boolean;
    /**
    * Flag for disable status
    */
    'disabled': boolean;
    /**
    * Flag for display only icon
    */
    'iconOnly': boolean;
  }
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
    /**
    * Observable of icons only menu
    */
    'iconsOnly$'?: Observable<boolean>;
    /**
    * Observable of application router
    */
    'routerChangeEvent'?: Observable<any>;
    /**
    * Observable of translate service
    */
    'translateService'?: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
    /**
    * Antivirus card plugin url
    */
    'url'?: string;
  }
  interface AntivirusMenuVmenuItem extends JSXBase.HTMLAttributes<HTMLAntivirusMenuVmenuItemElement> {
    /**
    * Flag for active status
    */
    'active'?: boolean;
    /**
    * Flag for disable status
    */
    'disabled'?: boolean;
    /**
    * Flag for display only icon
    */
    'iconOnly'?: boolean;
  }

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


