import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'antivirus-card-table-row',
  styleUrl: 'styles/$.scss',
})
export class History {
  @Prop({ reflect: true })
  disabled: boolean;
  @Prop({ reflect: true, attribute: 'action-hover' })
  actionHover: boolean;

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
