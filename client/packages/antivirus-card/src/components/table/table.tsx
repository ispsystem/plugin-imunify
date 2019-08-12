import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'antivirus-card-table',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Table {
  render() {
    return (
      <Host>
        <div class="ngispui-table-header isp-table-header_theme_light">
          <slot name="table-header" />
        </div>
        <div class="ngispui-table-body">
          <slot name="table-body" />
        </div>
        <div class="ngispui-table-footer">
          <div class="isp-table-footer__content">
            <div class="isp-table-footer__container">
              <slot name="table-footer" />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
