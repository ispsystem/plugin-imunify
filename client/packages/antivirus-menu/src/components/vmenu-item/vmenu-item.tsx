import { Component, h, Prop } from '@stencil/core';

/**
 * Antivirus menu icon component
 */
@Component({
  tag: 'antivirus-menu-vmenu-item',
  styleUrls: ['./scss/$.scss'],
  shadow: true,
})
export class VMenuItem {
  /** Flag for active status */
  @Prop({ reflect: true }) active: boolean;

  /** Flag for disable status */
  @Prop({ reflect: true }) disabled: boolean;

  /** Flag for display only icon */
  @Prop({ reflect: true, attribute: 'icon-only' }) iconOnly: boolean;

  render() {
    return (
      <div class="vmenu-item__wrap">
        <div class="vmenu-item__icon">
          <slot name="vmenu-icon" />
        </div>
        {!this.iconOnly && (
          <div class="vmenu-item__label">
            <slot name="vmenu-label" />
          </div>
        )}
        <slot />
      </div>
    );
  }
}
