import { AbstractElement, Define } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import '../button';
import styles from './styles/$.pcss';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-infected-files')
export default class PluginImunifyAvCardInfectedFiles extends AbstractElement<TemplateResult> {
  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <p class="stub-text">
        Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке. Для лечения
        вирусов вам понадобится Imunify Pro. Оформить подписку можно сейчас.
      </p>

      <plugin-imunifyav-card-button btn-theme="accent">Оформить подписку на Imunify Pro</plugin-imunifyav-card-button>
    `;
  }
}
