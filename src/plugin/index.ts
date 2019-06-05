import { AbstractElement, Define } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles.css';

/**
 * The demo web component with lit-html render engine
 */
// @Define('plugin-imunifyav-widget')
export default class PluginImunifyAvWidget extends AbstractElement<TemplateResult> {
  title = 'Антивирус';
  state = this._changeStatus(true);

  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <section @click=${this.handleClickSection.bind(this)} class="vepp-overview-widget-list__item vepp-widget_adaptive">
        <div>
          <a class="vepp-overview-widget-list__item-link" href="#/site/1/settings/files">
            ${this.title}
          </a>
        </div>
        <div
          class="vepp-overview-widget-list__item-overflow vepp-widget-text_additional vepp-widget-text_with-margin-adaptive vepp-widget-text_success"
          type="additional"
        >
          ${this.state.statusMsg}
        </div>
        <div
          class="vepp-overview-widget-list__item-overflow vepp-widget-text_additional vepp-widget-text_with-margin-adaptive"
          type="additional"
        >
          ${this.state.descMsg}
        </div>
        <div class="vepp-widget-icon_adaptive">
          <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 6.97849C0 6.97849 7.35142 5.55649 10.6916 3.78833C14.0317 2.02016 17.1472 0 17.1472 0C17.1472 0 19.357 1.54075 23.6027 3.78833C27.8485 6.0359 34.0949 6.97849 34.0949 6.97849L34.4425 16.7118C34.814 27.1115 27.4119 37.4965 17.1472 39.2072H16.9129C7.00023 37.4783 0 27.5488 0 17.4864L0 6.97849Z"
              fill="white"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 6.97849V17.4864C0 27.5488 7.21224 38.271 17.1249 40C27.3897 38.2892 34.814 27.1115 34.4425 16.7118L34.0949 6.97849C34.0949 6.97849 27.8485 6.0359 23.6027 3.78833C19.357 1.54075 17.1472 0 17.1472 0C17.1472 0 14.0317 2.02016 10.6916 3.78833C7.35142 5.55649 0 6.97849 0 6.97849ZM17.1308 1.83052C16.8147 2.0281 16.4214 2.27135 15.9696 2.54552C14.7585 3.28053 13.1169 4.24415 11.4109 5.14721C9.56135 6.12631 6.72548 6.96059 4.47402 7.53611C3.32907 7.82878 2.29122 8.06523 1.53754 8.22894V17.4864C1.53754 26.7139 8.08715 36.7348 17.1308 38.4385C26.4991 36.7469 33.2467 26.3069 32.906 16.7667L32.6027 8.27546C31.944 8.14827 31.0665 7.96439 30.0724 7.71896C27.9382 7.19202 25.172 6.35875 22.8834 5.14721C20.7296 4.00708 19.087 3.04346 17.9773 2.36101C17.6481 2.15854 17.3657 1.98079 17.1308 1.83052Z"
              fill="#344A5E"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.57129 10.9014C4.57129 10.9014 10.0356 9.84442 12.5184 8.53014C15.0011 7.21585 17.3168 5.71426 17.3168 5.71426C17.3168 5.71426 18.9594 6.85951 22.1153 8.53014C25.2712 10.2008 29.9141 10.9014 29.9141 10.9014L30.1725 18.1362C30.4486 25.8664 24.9466 32.6014 17.3168 33.873V33.873V33.873C9.94868 32.5879 4.57129 26.1914 4.57129 18.712L4.57129 10.9014Z"
              fill="#30BA9A"
            />
            <rect x="13.0078" y="10.9763" width="8.89524" height="12.1937" rx="4.44762" stroke="#344A5E" />
            <path
              d="M23.6136 21.8348V27.0234C23.6136 27.2996 23.3897 27.5235 23.1136 27.5235H11.9199C11.6438 27.5235 11.4199 27.2996 11.4199 27.0235V21.8348C11.4199 18.4676 14.1496 15.738 17.5167 15.738C20.8839 15.738 23.6136 18.4676 23.6136 21.8348Z"
              fill="white"
              stroke="#344A5E"
            />
            <path d="M17.6492 21.5873V23.5664" stroke="#344A5E" stroke-width="1.2" stroke-linecap="round" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M17.6682 21.7142C18.2994 21.7142 18.8111 21.2025 18.8111 20.5714C18.8111 19.9402 18.2994 19.4285 17.6682 19.4285C17.0371 19.4285 16.5254 19.9402 16.5254 20.5714C16.5254 21.2025 17.0371 21.7142 17.6682 21.7142Z"
              fill="#344A5E"
            />
          </svg>
        </div>
        <a
          class="ngispui-link ngispui-link_type_hover-dropdown ngispui-link_size_small ngispui-link_color_primary"
          rel="noopener noreferrer"
        >
          ${this.state.actionMsg}
        </a>
      </section>
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
