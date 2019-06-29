import { Component, h, Host, Prop } from '@stencil/core';
import { VirusesCheckIcon } from '../icons/viruses-check';
import { StartCheckIcon } from '../icons/start-check';
import { SettingsIcon } from '../icons/settings';
import { LockIcon } from '../icons/lock';
import { CheckListIcon } from '../icons/check-list';
import { AntivirusModel } from '../../models/Antivirus';

import { autorun } from 'mobx';

@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss'
})
export class Preview {
  @Prop()
  store: AntivirusModel;

  constructor() {
    autorun(() => {
      // console.log(store)
      // console.log(222222);
      console.log(222222, this.store.catScheduledActions);
      // this.store = this.store;
    });
  }

  render() {
    return (
      <Host>
        <div style={{ position: 'absolute', right: '20px', cursor: 'pointer' }}>
          <SettingsIcon />
        </div>
        <p class="before-check">Последняя проверка сегодня в 06:00</p>
        {/* <p class="next-check">
          Следующая проверка: 04.06.2019 Ежедневно
          <span style={{ 'margin-left': '5px', 'vertical-align': 'middle' }}>
            <LockIcon />
          </span>
        </p> */}
        {this.renderScheduleMessage()}
        <div style={{ display: 'flex', 'margin-top': '25px' }}>
          <VirusesCheckIcon />
          <div style={{ display: 'flex', 'flex-direction': 'column', 'margin-left': '20px', 'justify-content': 'center' }}>
            <span>Заражено 4 файла</span>
            <div style={{ display: 'inline' }}>
              <a class="link link_small link_indent-right">Лечить</a>
              <a class="link link_small">Подробнее</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', 'margin-top': '25px' }}>
          <CheckListIcon />
          <div style={{ display: 'flex', 'flex-direction': 'column', 'margin-left': '20px', 'justify-content': 'center' }}>
            <span>Сайт находится в чёных списках</span>
            <div style={{ display: 'inline' }}>
              <a class="link link_small">Как исправить</a>
            </div>
          </div>
        </div>
        <div class="link" style={{ 'margin-top': '25px', height: '28px' }}>
          <StartCheckIcon />
        </div>
      </Host>
    );
  }

  renderScheduleMessage = () =>
    this.store.catScheduledActions ? (
      <p class="next-check">
        Следующая проверка: 04.06.2019 Ежедневно
        <span style={{ 'margin-left': '5px', 'vertical-align': 'middle' }}>
          <LockIcon />
        </span>
      </p>
    ) : null;
}
