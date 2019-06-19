import { AbstractElement, Define } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles/$.pcss';
import './lock.icon';
import './viruses-check.icon';
import './check-list.icon';
import './start-check.btn';
import './settings.icon';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-preview')
export default class PluginImunifyAvCardPreview extends AbstractElement<TemplateResult> {
  title = 'Антивирус ImunifyAV';
  state = this._changeStatus(true);

  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <plugin-imunifyav-card-icon__settings style="position: absolute; right: 20px; cursor: pointer;"></plugin-imunifyav-card-icon__settings>
      <p class="before-check">Последняя проверка сегодня в 06:00</p>
      <p class="next-check">
        Следующая проверка: 04.06.2019 Ежедневно
        <plugin-imunifyav-card-icon__lock style="vertical-align: middle;"></plugin-imunifyav-card-icon__lock>
      </p>
      <div style="display: flex; margin-top: 25px">
        <plugin-imunifyav-card-icon__viruses-check style="display: flex"></plugin-imunifyav-card-icon__viruses-check>
        <div style="display: flex; flex-direction: column; margin-left: 20px; justify-content: center;">
          <span>Заражено 4 файла</span>
          <div style="display: inline;">
            <a class="link">Лечить</a>
            <a class="link">Подробнее</a>
          </div>
        </div>
      </div>
      <div style="display: flex; margin-top: 25px">
        <plugin-imunifyav-card-icon__check-list style="display: flex"></plugin-imunifyav-card-icon__check-list>
        <div style="display: flex; flex-direction: column; margin-left: 20px; justify-content: center;">
          <span>Сайт находится в чёных списках</span>
          <div style="display: inline;">
            <a class="link">Как исправить</a>
          </div>
        </div>
      </div>
      <plugin-imunifyav-card-btn__start-check class="link" style="margin-top: 25px; height: 28px;"></plugin-imunifyav-card-btn__start-check>
    `;
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
