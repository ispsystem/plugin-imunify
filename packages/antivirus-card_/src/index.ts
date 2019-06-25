import { AbstractElement, state } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles/$.pcss';

import './preview';
import './infected-files';
import './navigation';

/**
 * The imunifyav-card web component
 */
export default class PluginImunifyAvCard extends AbstractElement<TemplateResult> {
  title = 'Антивирус ImunifyAV';
  state = this._changeStatus(true);

  @state()
  items: {
    label: string;
    active: boolean;
  }[] = [
    {
      label: 'Обзор',
      active: true
    },
    {
      label: 'Заражённые файлы',
      active: false
    },
    {
      label: 'История сканирований',
      active: false
    }
  ];

  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <plugin-imunifyav-card-navigation
        .items=${this.items}
        @click-item="${this.handleClickItem.bind(this)}"
      ></plugin-imunifyav-card-navigation>

      <plugin-imunifyav-card-infected-files></plugin-imunifyav-card-infected-files>
      <plugin-imunifyav-card-preview></plugin-imunifyav-card-preview>

      <div>
        <div class="ngispui-table">
          <div class="ngispui-table-header vepp-site-domains-table-list__header isp-table-header_theme_light">
            <div class="ngispui-table-row" style="height: 50px; vertical-align: middle;">
              <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style="width: 200px;">
                Имя записи
              </div>
              <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style="width: 240px;">
                Тип записи
              </div>
              <div
                align="right"
                class="ngispui-table-cell isp-table-cell_header vepp-site-domains-table-list__field-numeric  isp-table-cell_align_right"
                style="width: 115px;"
              >
                TTL, сек
              </div>
              <div class="ngispui-table-cell isp-table-cell_header isp-table-cell_align_left" style="width: 264px;">
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
              <div
                align="right"
                class="ngispui-table-cell vepp-site-domains-table-list__field-numeric  isp-table-cell_align_right isp-table-cell_doubleline"
              >
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
                      <span style="margin-right: 16px;margin-left: 8px;">25</span>
                      <button class="ngispui-pagination__control ngispui-pagination__control_prev"></button>
                      1&nbsp;<span>из</span>&nbsp;1
                      <button class="ngispui-pagination__control ngispui-pagination__control_next"></button>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleClickItem(e: MouseEvent) {
    const beforeIndex = this.items.findIndex(item => item.active);
    this.items[beforeIndex].active = false;
    this.items[e.detail['index']].active = true;

    this.items = this.items;
  }

  handleClickSection(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.state = this._changeStatus(this.state.isProcessing);
  }

  _changeStatus(isProcessing = false) {
    if (isProcessing) {
      return {
        isProcessing: false,
        statusMsg: 'угроз не обнаружено',
        descMsg: 'последняя проверка: сегодня',
        actionMsg: 'Проверить ещё раз'
      };
    } else {
      return {
        isProcessing: true,
        statusMsg: 'проверяем сайт на вирусы',
        descMsg: 'ешё примерно 10 минут',
        actionMsg: 'Отчёт'
      };
    }
  }
}
