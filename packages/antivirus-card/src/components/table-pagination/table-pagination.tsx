import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'antivirus-card-table-pagination',
  styleUrl: 'styles/$.scss'
})
export class History {
  @Prop({ reflect: true })
  disabled: boolean;
  @Prop({ reflect: true, attribute: 'action-hover' })
  actionHover: boolean;

  /** @todo: need to send labels as params */
  render() {
    return (
      <Host>
        <span>На странице:</span>
        <span style={{ 'margin-right': '16px', 'margin-left': '8px' }}>25</span>
        <button class="pagination__control pagination__control_prev" />
        1&nbsp;<span>из</span>&nbsp;1
        <button class="pagination__control pagination__control_next" />
      </Host>
    );
  }
}
