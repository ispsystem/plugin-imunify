/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  Notifier,
} from './redux/reducers';
import {
  Observable,
} from 'rxjs';
import {
  languageTypes,
} from './constants';
import {
  ButtonType,
  ThemePalette,
} from './components/button/button.interface';
import {
  Validator,
} from './utils/validators';

export namespace Components {
  interface AntivirusCard {
    /**
    * global notifier object
    */
    'notifier': Notifier;
    /**
    * main app translate service
    */
    'translateService': { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  }
  interface AntivirusCardButton {
    'btnType': ButtonType;
    'customCSSClass': string;
    'isDisabled': boolean;
    'theme': ThemePalette;
  }
  interface AntivirusCardCheckbox {
    /**
    * Flag fore display type block
    */
    'block': boolean;
    /**
    * Bold highlight active checkbox text
    */
    'bold': boolean;
    /**
    * Value for checkbox
    */
    'checked': boolean;
    /**
    * Make read only available
    */
    'readonly': boolean;
    /**
    * Text wrapping around the checkbox
    */
    'unwrap': boolean;
  }
  interface AntivirusCardDashboard {}
  interface AntivirusCardDropdown {
    /**
    * Max width for dropdown content
    */
    'maxWidth': string;
    /**
    * Toogle dropdown state
    * @param event - DOM event
    */
    'toogle': (event: Event) => Promise<void>;
  }
  interface AntivirusCardHint {
    /**
    * Flag for display accent icon
    */
    'accent': boolean;
  }
  interface AntivirusCardHistory {}
  interface AntivirusCardInfectedFiles {}
  interface AntivirusCardInput {
    /**
    * Flag for disable input field
    */
    'disabled': boolean;
    /**
    * Value for input placeholder
    */
    'placeholder': string;
    /**
    * List of custom validators
    */
    'validator': Validator<string> | Array<Validator<string>>;
    /**
    * Value for input field
    */
    'value': string;
  }
  interface AntivirusCardModal {
    'modalWidth': string;
    'visible': boolean;
  }
  interface AntivirusCardNavigation {
    'items': {
      label: string;
      active?: boolean;
    }[];
  }
  interface AntivirusCardPreview {}
  interface AntivirusCardSpinnerRound {}
  interface AntivirusCardSwitcher {}
  interface AntivirusCardSwitcherOption {
    'active': boolean;
    'disabled': boolean;
    'last': boolean;
    'selectedDisabled': boolean;
  }
  interface AntivirusCardTable {}
  interface AntivirusCardTableCell {
    'alignLeft': boolean;
    'alignRight': boolean;
    'doubleline': boolean;
    'singleline': boolean;
  }
  interface AntivirusCardTablePagination {
    'actionHover': boolean;
    'disabled': boolean;
  }
  interface AntivirusCardTableRow {
    'actionHover': boolean;
    'disabled': boolean;
  }
}

declare global {


  interface HTMLAntivirusCardElement extends Components.AntivirusCard, HTMLStencilElement {}
  var HTMLAntivirusCardElement: {
    prototype: HTMLAntivirusCardElement;
    new (): HTMLAntivirusCardElement;
  };

  interface HTMLAntivirusCardButtonElement extends Components.AntivirusCardButton, HTMLStencilElement {}
  var HTMLAntivirusCardButtonElement: {
    prototype: HTMLAntivirusCardButtonElement;
    new (): HTMLAntivirusCardButtonElement;
  };

  interface HTMLAntivirusCardCheckboxElement extends Components.AntivirusCardCheckbox, HTMLStencilElement {}
  var HTMLAntivirusCardCheckboxElement: {
    prototype: HTMLAntivirusCardCheckboxElement;
    new (): HTMLAntivirusCardCheckboxElement;
  };

  interface HTMLAntivirusCardDashboardElement extends Components.AntivirusCardDashboard, HTMLStencilElement {}
  var HTMLAntivirusCardDashboardElement: {
    prototype: HTMLAntivirusCardDashboardElement;
    new (): HTMLAntivirusCardDashboardElement;
  };

  interface HTMLAntivirusCardDropdownElement extends Components.AntivirusCardDropdown, HTMLStencilElement {}
  var HTMLAntivirusCardDropdownElement: {
    prototype: HTMLAntivirusCardDropdownElement;
    new (): HTMLAntivirusCardDropdownElement;
  };

  interface HTMLAntivirusCardHintElement extends Components.AntivirusCardHint, HTMLStencilElement {}
  var HTMLAntivirusCardHintElement: {
    prototype: HTMLAntivirusCardHintElement;
    new (): HTMLAntivirusCardHintElement;
  };

  interface HTMLAntivirusCardHistoryElement extends Components.AntivirusCardHistory, HTMLStencilElement {}
  var HTMLAntivirusCardHistoryElement: {
    prototype: HTMLAntivirusCardHistoryElement;
    new (): HTMLAntivirusCardHistoryElement;
  };

  interface HTMLAntivirusCardInfectedFilesElement extends Components.AntivirusCardInfectedFiles, HTMLStencilElement {}
  var HTMLAntivirusCardInfectedFilesElement: {
    prototype: HTMLAntivirusCardInfectedFilesElement;
    new (): HTMLAntivirusCardInfectedFilesElement;
  };

  interface HTMLAntivirusCardInputElement extends Components.AntivirusCardInput, HTMLStencilElement {}
  var HTMLAntivirusCardInputElement: {
    prototype: HTMLAntivirusCardInputElement;
    new (): HTMLAntivirusCardInputElement;
  };

  interface HTMLAntivirusCardModalElement extends Components.AntivirusCardModal, HTMLStencilElement {}
  var HTMLAntivirusCardModalElement: {
    prototype: HTMLAntivirusCardModalElement;
    new (): HTMLAntivirusCardModalElement;
  };

  interface HTMLAntivirusCardNavigationElement extends Components.AntivirusCardNavigation, HTMLStencilElement {}
  var HTMLAntivirusCardNavigationElement: {
    prototype: HTMLAntivirusCardNavigationElement;
    new (): HTMLAntivirusCardNavigationElement;
  };

  interface HTMLAntivirusCardPreviewElement extends Components.AntivirusCardPreview, HTMLStencilElement {}
  var HTMLAntivirusCardPreviewElement: {
    prototype: HTMLAntivirusCardPreviewElement;
    new (): HTMLAntivirusCardPreviewElement;
  };

  interface HTMLAntivirusCardSpinnerRoundElement extends Components.AntivirusCardSpinnerRound, HTMLStencilElement {}
  var HTMLAntivirusCardSpinnerRoundElement: {
    prototype: HTMLAntivirusCardSpinnerRoundElement;
    new (): HTMLAntivirusCardSpinnerRoundElement;
  };

  interface HTMLAntivirusCardSwitcherElement extends Components.AntivirusCardSwitcher, HTMLStencilElement {}
  var HTMLAntivirusCardSwitcherElement: {
    prototype: HTMLAntivirusCardSwitcherElement;
    new (): HTMLAntivirusCardSwitcherElement;
  };

  interface HTMLAntivirusCardSwitcherOptionElement extends Components.AntivirusCardSwitcherOption, HTMLStencilElement {}
  var HTMLAntivirusCardSwitcherOptionElement: {
    prototype: HTMLAntivirusCardSwitcherOptionElement;
    new (): HTMLAntivirusCardSwitcherOptionElement;
  };

  interface HTMLAntivirusCardTableElement extends Components.AntivirusCardTable, HTMLStencilElement {}
  var HTMLAntivirusCardTableElement: {
    prototype: HTMLAntivirusCardTableElement;
    new (): HTMLAntivirusCardTableElement;
  };

  interface HTMLAntivirusCardTableCellElement extends Components.AntivirusCardTableCell, HTMLStencilElement {}
  var HTMLAntivirusCardTableCellElement: {
    prototype: HTMLAntivirusCardTableCellElement;
    new (): HTMLAntivirusCardTableCellElement;
  };

  interface HTMLAntivirusCardTablePaginationElement extends Components.AntivirusCardTablePagination, HTMLStencilElement {}
  var HTMLAntivirusCardTablePaginationElement: {
    prototype: HTMLAntivirusCardTablePaginationElement;
    new (): HTMLAntivirusCardTablePaginationElement;
  };

  interface HTMLAntivirusCardTableRowElement extends Components.AntivirusCardTableRow, HTMLStencilElement {}
  var HTMLAntivirusCardTableRowElement: {
    prototype: HTMLAntivirusCardTableRowElement;
    new (): HTMLAntivirusCardTableRowElement;
  };
  interface HTMLElementTagNameMap {
    'antivirus-card': HTMLAntivirusCardElement;
    'antivirus-card-button': HTMLAntivirusCardButtonElement;
    'antivirus-card-checkbox': HTMLAntivirusCardCheckboxElement;
    'antivirus-card-dashboard': HTMLAntivirusCardDashboardElement;
    'antivirus-card-dropdown': HTMLAntivirusCardDropdownElement;
    'antivirus-card-hint': HTMLAntivirusCardHintElement;
    'antivirus-card-history': HTMLAntivirusCardHistoryElement;
    'antivirus-card-infected-files': HTMLAntivirusCardInfectedFilesElement;
    'antivirus-card-input': HTMLAntivirusCardInputElement;
    'antivirus-card-modal': HTMLAntivirusCardModalElement;
    'antivirus-card-navigation': HTMLAntivirusCardNavigationElement;
    'antivirus-card-preview': HTMLAntivirusCardPreviewElement;
    'antivirus-card-spinner-round': HTMLAntivirusCardSpinnerRoundElement;
    'antivirus-card-switcher': HTMLAntivirusCardSwitcherElement;
    'antivirus-card-switcher-option': HTMLAntivirusCardSwitcherOptionElement;
    'antivirus-card-table': HTMLAntivirusCardTableElement;
    'antivirus-card-table-cell': HTMLAntivirusCardTableCellElement;
    'antivirus-card-table-pagination': HTMLAntivirusCardTablePaginationElement;
    'antivirus-card-table-row': HTMLAntivirusCardTableRowElement;
  }
}

declare namespace LocalJSX {
  interface AntivirusCard extends JSXBase.HTMLAttributes<HTMLAntivirusCardElement> {
    /**
    * global notifier object
    */
    'notifier'?: Notifier;
    /**
    * main app translate service
    */
    'translateService'?: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  }
  interface AntivirusCardButton extends JSXBase.HTMLAttributes<HTMLAntivirusCardButtonElement> {
    'btnType'?: ButtonType;
    'customCSSClass'?: string;
    'isDisabled'?: boolean;
    'theme'?: ThemePalette;
  }
  interface AntivirusCardCheckbox extends JSXBase.HTMLAttributes<HTMLAntivirusCardCheckboxElement> {
    /**
    * Flag fore display type block
    */
    'block'?: boolean;
    /**
    * Bold highlight active checkbox text
    */
    'bold'?: boolean;
    /**
    * Value for checkbox
    */
    'checked'?: boolean;
    /**
    * Event by change checkbox value
    */
    'onСhanged'?: (event: CustomEvent<boolean>) => void;
    /**
    * Make read only available
    */
    'readonly'?: boolean;
    /**
    * Text wrapping around the checkbox
    */
    'unwrap'?: boolean;
  }
  interface AntivirusCardDashboard extends JSXBase.HTMLAttributes<HTMLAntivirusCardDashboardElement> {
    /**
    * open ImunifyAV+ buy modal
    */
    'onOpenBuyModal'?: (event: CustomEvent<any>) => void;
    /**
    * @todo : open new scan modal
    */
    'onOpenNewScanModal'?: (event: CustomEvent<any>) => void;
  }
  interface AntivirusCardDropdown extends JSXBase.HTMLAttributes<HTMLAntivirusCardDropdownElement> {
    /**
    * Max width for dropdown content
    */
    'maxWidth'?: string;
  }
  interface AntivirusCardHint extends JSXBase.HTMLAttributes<HTMLAntivirusCardHintElement> {
    /**
    * Flag for display accent icon
    */
    'accent'?: boolean;
  }
  interface AntivirusCardHistory extends JSXBase.HTMLAttributes<HTMLAntivirusCardHistoryElement> {}
  interface AntivirusCardInfectedFiles extends JSXBase.HTMLAttributes<HTMLAntivirusCardInfectedFilesElement> {
    'onOpenBuyModal'?: (event: CustomEvent<any>) => void;
  }
  interface AntivirusCardInput extends JSXBase.HTMLAttributes<HTMLAntivirusCardInputElement> {
    /**
    * Flag for disable input field
    */
    'disabled'?: boolean;
    /**
    * Event for input value changed
    */
    'onChanged'?: (event: CustomEvent<string>) => void;
    /**
    * Value for input placeholder
    */
    'placeholder'?: string;
    /**
    * List of custom validators
    */
    'validator'?: Validator<string> | Array<Validator<string>>;
    /**
    * Value for input field
    */
    'value'?: string;
  }
  interface AntivirusCardModal extends JSXBase.HTMLAttributes<HTMLAntivirusCardModalElement> {
    'modalWidth'?: string;
    'visible'?: boolean;
  }
  interface AntivirusCardNavigation extends JSXBase.HTMLAttributes<HTMLAntivirusCardNavigationElement> {
    'items'?: {
      label: string;
      active?: boolean;
    }[];
    'onClickItem'?: (event: CustomEvent<any>) => void;
  }
  interface AntivirusCardPreview extends JSXBase.HTMLAttributes<HTMLAntivirusCardPreviewElement> {
    /**
    * to change selected tab item (horizontal menu)
    */
    'onClickItem'?: (event: CustomEvent<any>) => void;
    /**
    * to open buy modal
    */
    'onOpenBuyModal'?: (event: CustomEvent<any>) => void;
  }
  interface AntivirusCardSpinnerRound extends JSXBase.HTMLAttributes<HTMLAntivirusCardSpinnerRoundElement> {}
  interface AntivirusCardSwitcher extends JSXBase.HTMLAttributes<HTMLAntivirusCardSwitcherElement> {}
  interface AntivirusCardSwitcherOption extends JSXBase.HTMLAttributes<HTMLAntivirusCardSwitcherOptionElement> {
    'active'?: boolean;
    'disabled'?: boolean;
    'last'?: boolean;
    'onSelected'?: (event: CustomEvent<any>) => void;
    'selectedDisabled'?: boolean;
  }
  interface AntivirusCardTable extends JSXBase.HTMLAttributes<HTMLAntivirusCardTableElement> {}
  interface AntivirusCardTableCell extends JSXBase.HTMLAttributes<HTMLAntivirusCardTableCellElement> {
    'alignLeft'?: boolean;
    'alignRight'?: boolean;
    'doubleline'?: boolean;
    'singleline'?: boolean;
  }
  interface AntivirusCardTablePagination extends JSXBase.HTMLAttributes<HTMLAntivirusCardTablePaginationElement> {
    'actionHover'?: boolean;
    'disabled'?: boolean;
  }
  interface AntivirusCardTableRow extends JSXBase.HTMLAttributes<HTMLAntivirusCardTableRowElement> {
    'actionHover'?: boolean;
    'disabled'?: boolean;
  }

  interface IntrinsicElements {
    'antivirus-card': AntivirusCard;
    'antivirus-card-button': AntivirusCardButton;
    'antivirus-card-checkbox': AntivirusCardCheckbox;
    'antivirus-card-dashboard': AntivirusCardDashboard;
    'antivirus-card-dropdown': AntivirusCardDropdown;
    'antivirus-card-hint': AntivirusCardHint;
    'antivirus-card-history': AntivirusCardHistory;
    'antivirus-card-infected-files': AntivirusCardInfectedFiles;
    'antivirus-card-input': AntivirusCardInput;
    'antivirus-card-modal': AntivirusCardModal;
    'antivirus-card-navigation': AntivirusCardNavigation;
    'antivirus-card-preview': AntivirusCardPreview;
    'antivirus-card-spinner-round': AntivirusCardSpinnerRound;
    'antivirus-card-switcher': AntivirusCardSwitcher;
    'antivirus-card-switcher-option': AntivirusCardSwitcherOption;
    'antivirus-card-table': AntivirusCardTable;
    'antivirus-card-table-cell': AntivirusCardTableCell;
    'antivirus-card-table-pagination': AntivirusCardTablePagination;
    'antivirus-card-table-row': AntivirusCardTableRow;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


