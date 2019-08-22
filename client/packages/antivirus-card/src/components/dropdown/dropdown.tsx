import '@ui5/webcomponents/dist/Popover';

import { Component, h, Method, Prop } from '@stencil/core';
import { CloseIcon } from '../icons/close';

/** Type for popover element */
export type PopoverElType = HTMLElement & {
  _isOpen: boolean;
  openBy: (control: HTMLElement | EventTarget) => void;
  close: () => void;
};

/**
 * Custom dropdown component
 */
@Component({
  tag: 'antivirus-card-dropdown',
  styleUrl: 'styles/$.scss',
})
export class Dropdown {
  /** Ref for ui5-popover element */
  popoverEl: PopoverElType;

  /** Element for attaching dropdown component, by default is root component */
  @Prop() attachNode: HTMLElement = document.querySelector('antivirus-card');

  /** Max width for dropdown content */
  @Prop({ reflect: true }) maxWidth = '330px';

  /**
   * Toggle dropdown state
   * @param event - DOM event
   */
  @Method()
  async toggle(event: Event) {
    if (this.popoverEl._isOpen) {
      this.popoverEl.close();
    } else {
      this.popoverEl.openBy(event.currentTarget);
    }
  }

  componentDidLoad() {
    setTimeout(() => {
      // Move dropdown element on attach node
      this.attachNode.shadowRoot.appendChild(this.popoverEl);
    });
  }

  /**
   * Lifecycle, remove dropdown element in attachNode
   */
  componentDidUnload() {
    this.popoverEl.remove();
  }

  render() {
    return (
      <ui5-popover class="popover" ref={(el: PopoverElType) => (this.popoverEl = el)} no-header>
        <span class="modal-close" onClick={() => this.popoverEl.close()}>
          <CloseIcon />
        </span>
        <div class="popover-content" style={{ 'max-width': this.maxWidth }}>
          <slot />
        </div>
      </ui5-popover>
    );
  }
}
