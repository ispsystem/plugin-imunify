import { Component, h, Host } from '@stencil/core';
import { VirusesCheckIcon } from '../icons/viruses-check';
import { StartCheckIcon } from '../icons/start-check';
import { SettingsIcon } from '../icons/settings';
import { LockIcon } from '../icons/lock';
import { CheckListIcon } from '../icons/check-list';

@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss'
})
export class Preview {
  render() {
    return (
      <Host>
        <div style={{ position: 'absolute', right: '20px', cursor: 'pointer' }}>
          <SettingsIcon />
        </div>
        <p class="before-check">Последняя проверка сегодня в 06:00</p>
        <p class="next-check">
          Следующая проверка: 04.06.2019 Ежедневно
          <span style={{ 'margin-left': '5px', 'vertical-align': 'middle' }}>
            <LockIcon />
          </span>
        </p>
        <div style={{ display: 'flex', 'margin-top': '25px' }}>
          <VirusesCheckIcon />
          <div style={{ display: 'flex', 'flex-direction': 'column', 'margin-left': '20px', 'justify-content': 'center' }}>
            <span>Заражено 4 файла</span>
            <div style={{ display: 'inline' }}>
              <a class="link">Лечить</a>
              <a class="link">Подробнее</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', 'margin-top': '25px' }}>
          <CheckListIcon />
          <div style={{ display: 'flex', 'flex-direction': 'column', 'margin-left': '20px', 'justify-content': 'center' }}>
            <span>Сайт находится в чёных списках</span>
            <div style={{ display: 'inline' }}>
              <a class="link">Как исправить</a>
            </div>
          </div>
        </div>
        <div class="link" style={{ 'margin-top': '25px', height: '28px' }}>
          <StartCheckIcon />
        </div>
      </Host>
    );
  }
}
