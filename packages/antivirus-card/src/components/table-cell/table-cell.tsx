import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'antivirus-card-table-cell',
  styleUrl: 'styles/$.scss'
})
export class History {
  @Prop({ reflect: true })
  doubleline: boolean;
  @Prop({ reflect: true })
  singleline: boolean;
  @Prop({ reflect: true, attribute: 'align-left' })
  alignLeft: boolean;
  @Prop({ reflect: true, attribute: 'align-right' })
  alignRight: boolean;

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
