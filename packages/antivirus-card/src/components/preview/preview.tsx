import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { VirusesCheckBadIcon } from '../icons/viruses-check-bad';
import { StartCheckIcon } from '../icons/start-check';
import { SettingsIcon } from '../icons/settings';
import { LockIcon } from '../icons/lock';
import { CheckListBadIcon } from '../icons/check-list-bad';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { AntivirusActions } from '../../models/antivirus.actions';
import { AntivirusState } from 'antivirus-card/src/models/antivirus.reducers';
import { declOfNum } from '../../utils/tools';
import { VirusesCheckGoodIcon } from '../icons/viruses-check-good';
import { CheckListGoodIcon } from '../icons/check-list-good';

@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss'
})
export class Preview {
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() lastScan: AntivirusState['lastScan'];
  @State() scanning: AntivirusState['scanning'];
  @State() hasScheduledActions: AntivirusState['hasScheduledActions'];
  @State() isProVersion: AntivirusState['isProVersion'];
  @State() infectedFiles: AntivirusState['infectedFiles'];
  @State() inBlackLists: AntivirusState['inBlackLists'];

  @Event() openBuyModal: EventEmitter;
  @Event({
    bubbles: true,
    composed: true
  })
  clickItem: EventEmitter;

  scanVirus: typeof AntivirusActions.scan;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus }));
    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan
    });
  }

  componentDidLoad() {
    if (this.lastScan === undefined) {
      this.scanVirus();
    }
  }

  disinfectVirusFiles() {
    if (this.isProVersion) {
      throw 'disinfectVirusFiles';
    } else {
      this.openBuyModal.emit();
    }
  }

  render() {
    return (
      <Host>
        {this.renderScheduleSetting()}
        {this.renderStatus()}
        {this.renderScheduleMessage()}

        {this.infectedFiles.length > 0 ? this.renderHasInfectedFiles(this.infectedFiles.length) : this.renderHasNotInfectedFiles()}

        {this.inBlackLists ? this.renderInBlackLists() : this.renderNotInBlackLists()}

        <div class="link" onClick={this.scanVirus.bind(this)} style={{ 'margin-top': '25px', height: '28px' }}>
          <StartCheckIcon />
        </div>
      </Host>
    );
  }

  renderStatus = () => {
    return this.scanning ? (
      <div style={{display: 'flex'}}>
        <p class="before-check">Идёт проверка сайта, ещё примерно 10 минут</p>
        <div class="antivirus-card-preview__spinner">
          <antivirus-card-spinner-round />
        </div>
      </div>
    ) : (
      <p class="before-check">Последняя проверка {this.lastScan}</p>
    );
  };

  renderScheduleMessage = () => {
    return this.hasScheduledActions ? (
      <p class="next-check">
        Следующая проверка: 04.06.2019 Ежедневно
        <span style={{ 'margin-left': '5px', 'vertical-align': 'middle' }}>
          <LockIcon />
        </span>
      </p>
    ) : null;
  };

  renderScheduleSetting = () => {
    return this.hasScheduledActions ? (
      <div style={{ position: 'absolute', right: '20px', cursor: 'pointer' }}>
        <SettingsIcon />
      </div>
    ) : null;
  };

  renderHasInfectedFiles = (infectedFilesCount: number) => {
    const infectedFilesWord1 = declOfNum(infectedFilesCount, ['Заражен', 'Заражено', 'Заражено']);
    const infectedFilesWord2 = declOfNum(infectedFilesCount, ['файл', 'файла', 'файлов']);

    return (
      <div class="antivirus-card-preview__container">
        <VirusesCheckBadIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>
            {infectedFilesWord1} {infectedFilesCount} {infectedFilesWord2}
          </span>
          <div style={{ display: 'inline' }}>
            <a class="link link_small link_indent-right" onClick={this.disinfectVirusFiles.bind(this)}>
              Лечить
            </a>
            <a class="link link_small" onClick={() => this.clickItem.emit(1)}>
              Подробнее
            </a>
          </div>
        </div>
      </div>
    );
  };

  renderHasNotInfectedFiles = () => {
    return (
      <div class="antivirus-card-preview__container">
        <VirusesCheckGoodIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>Вирусов не обнаружили</span>
        </div>
      </div>
    );
  };

  renderInBlackLists = () => {
    return (
      <div class="antivirus-card-preview__container">
        <CheckListBadIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>Сайт находится в чёных списках</span>
          <div style={{ display: 'inline' }}>
            <a class="link link_small">Как исправить</a>
          </div>
        </div>
      </div>
    );
  };

  renderNotInBlackLists = () => {
    return (
      <div class="antivirus-card-preview__container">
        <CheckListGoodIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>Сайта в чёрных списках нет</span>
        </div>
      </div>
    );
  };
}
