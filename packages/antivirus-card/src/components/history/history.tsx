import { Component, h } from '@stencil/core';

@Component({
  tag: 'antivirus-card-history',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class History {
  render() {
    return (
      <div class="ngispui-table">
        <div class="ngispui-table-header vepp-site-domains-table-list__header isp-table-header_theme_light">
          <div class="ngispui-table-row" style={{ height: '50px', 'vertical-align': 'middle' }}>
            <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style={{ width: '200px' }}>
              Имя записи
            </div>
            <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style={{ width: '240px' }}>
              Тип записи
            </div>
            <div
              class="ngispui-table-cell isp-table-cell_header vepp-site-domains-table-list__field-numeric  isp-table-cell_align_right"
              style={{ width: '115px' }}
            >
              TTL, сек
            </div>
            <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style={{ width: '264px' }}>
              Значение
            </div>
          </div>
        </div>
        <div class="ngispui-table-body">
          <div class="ngispui-table-row isp-table-row_action_hover">
            <div class="ngispui-table-cell isp-table-cell_align_left isp-table-cell_doubleline">
              <a
                class="ngispui-link ngispui-link_type_default-hover ngispui-link_size_regular ngispui-link_color_primary"
                rel="noopener noreferrer"
              >
                29.05.2019
              </a>
              <span class="isp-table-cell__add-text isp-table-cell__main-text">6:45</span>
            </div>
            <div class="ngispui-table-cell isp-table-cell_align_left isp-table-cell_doubleline">
              <span class="isp-table-cell__main-text"> A (адрес internet v4) </span>
            </div>
            <div class="ngispui-table-cell vepp-site-domains-table-list__field-numeric  isp-table-cell_align_right isp-table-cell_doubleline">
              <span class="isp-table-cell__main-text"> 3600</span>
            </div>
            <div class="ngispui-table-cell isp-table-cell_align_left isp-table-cell_doubleline">
              <span class="isp-table-cell__main-text"> 172.31.246.105 </span>
            </div>
          </div>
        </div>
        <div class="ngispui-table-footer">
          <div class="isp-table-footer__content">
            <div class="isp-table-footer__container">
              <div class="vepp-site-domains-table-list__footer">
                <span>1 запись</span>
                <div>
                  <section class="ngispui-pagination">
                    <span>На странице:</span>
                    <span style={{ 'margin-right': '16px', 'margin-left': '8px' }}>25</span>
                    <button class="ngispui-pagination__control ngispui-pagination__control_prev" />
                    1&nbsp;<span>из</span>&nbsp;1
                    <button class="ngispui-pagination__control ngispui-pagination__control_next" />
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
