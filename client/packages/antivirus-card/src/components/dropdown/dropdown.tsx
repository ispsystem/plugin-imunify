import '@ui5/webcomponents/dist/Popover';

import { Component, h, Host, Method, Prop } from '@stencil/core';
import { CloseIcon } from '../icons/close';

/** Type for popover element */
export type PopoverElType = HTMLElement & {
  opened: boolean;
  openBy: (control: HTMLElement | EventTarget) => void;
  close: () => void;
};

/**
 * Custom dropdown component
 */
@Component({
  tag: 'antivirus-card-dropdown',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Dropdown {
  /** Ref for ui5-popover element */
  public popoverEl!: PopoverElType;

  /** Max width for dropdown content */
  @Prop({ reflect: true }) maxWidth: string = '330px';

  componentDidLoad() {
    this.popoverEl.addEventListener('beforeClose', () => (this.popoverEl.opened = false));
  }

  /**
   * Toggle dropdown state
   * @param event - DOM event
   */
  @Method()
  async toggle(event: Event) {
    if (this.popoverEl.opened) {
      this.popoverEl.close();
    } else {
      this.popoverEl.opened = true;
      this.popoverEl.openBy(event.currentTarget);
    }
  }

  render() {
    return (
      <Host>
        <ui5-popover class="popover" ref={(el: PopoverElType) => (this.popoverEl = el)} no-header>
          <span class="modal-close" onClick={() => this.popoverEl.close()}>
            <CloseIcon />
          </span>
          <div class="popover-content" style={{ 'max-width': this.maxWidth }}>
            <slot />
          </div>
        </ui5-popover>
      </Host>
    );
  }
}
