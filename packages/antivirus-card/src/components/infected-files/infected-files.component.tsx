import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class ButtonComponent {
  render() {
    return (
      <Host>
        <p class="stub-text">
          Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке. Для лечения
          вирусов вам понадобится Imunify Pro. Оформить подписку можно сейчас.
        </p>

        <antivirus-card-button btn-theme="accent">Оформить подписку на Imunify Pro</antivirus-card-button>
      </Host>
    );
  }
}
