import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter, Watch } from '@stencil/core';
import { VirusesCheckBadIcon } from '../icons/viruses-check-bad';
import { StartCheckIcon } from '../icons/start-check';
import { SettingsIcon } from '../icons/settings';
import { LockIcon } from '../icons/lock';
import { CheckListBadIcon } from '../icons/check-list-bad';
import { Store } from '@stencil/redux';
import { RootState, INotifier } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { AntivirusActions } from '../../models/antivirus.actions';
import { AntivirusState } from 'antivirus-card/src/models/antivirus.reducers';
import { pad } from '../../utils/tools';
import { VirusesCheckGoodIcon } from '../icons/viruses-check-good';
import { CheckListGoodIcon } from '../icons/check-list-good';
import { ITranslate } from '../../models/translate.reducers';
import { DropdownElType } from '../dropdown/dropdown';

/**
 * Preview component for antivirus-card
 */
@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss'
})
export class Preview {
  /** Ref for dropdown element */
  public dropdownEl!: DropdownElType;

  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() scanning: AntivirusState['scanning'];
  @State() hasScheduledActions: AntivirusState['hasScheduledActions'];
  @State() isProVersion: AntivirusState['isProVersion'];
  @State() infectedFiles: AntivirusState['infectedFiles'];
  @State() inBlackLists: AntivirusState['inBlackLists'];
  @State() history: AntivirusState['history'];
  @State() notifier: INotifier;
  /** translate object */
  @State() t: ITranslate;

  @State() lastScan: string;

  @Event() openBuyModal: EventEmitter;
  @Event({
    bubbles: true,
    composed: true
  })
  clickItem: EventEmitter;

  scanVirus: typeof AntivirusActions.scan;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, notifier: state.notifier, t: state.translate }));
    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan
    });

    this.setLastScan(this.history);
  }

  @Watch('history')
  setLastScan(newValue: AntivirusState['history']) {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const date = newValue[newValue.length - 1].date;
      this.lastScan = `${this.getDayMonthYearAsStr(new Date(date))} в ${this.getTimeAsStr(new Date(date))}`;
    }
  }

  getDayMonthYearAsStr(date: Date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  getTimeAsStr(date: Date) {
    return `${date.getHours()}.${pad(date.getMinutes())}`;
  }

  disinfectVirusFiles() {
    if (this.isProVersion) {
      throw 'disinfectVirusFiles';
    } else {
      this.openBuyModal.emit();
    }
  }

  handleBlackListsHelpClick(ev: MouseEvent) {
    this.dropdownEl.toogle(ev);
  }

  render() {
    return (
      <Host>
        {this.renderScheduleSetting()}
        {this.renderStatus()}
        {this.renderScheduleMessage()}

        {this.infectedFiles && this.infectedFiles.length > 0
          ? this.renderHasInfectedFiles(this.infectedFiles.length)
          : this.renderHasNotInfectedFiles()}

        {this.inBlackLists ? this.renderInBlackLists() : this.renderNotInBlackLists()}

        <div class="link" onClick={() => this.scanVirus(this.notifier)} style={{ 'margin-top': '25px', height: '28px' }}>
          <StartCheckIcon btnLabel={this.t.msg('NEW_SCAN_BTN')} />
        </div>
        <antivirus-card-dropdown ref={(el: DropdownElType) => this.dropdownEl = el}>
          <p style={{ margin: '0' }}>{this.t.msg(['PREVIEW', 'HELP'])}</p>
          <p style={{ margin: '20px 0 0 0' }}>{this.t.msg(['PREVIEW', 'HELP_RECOMMENDATION'])}</p>
        </antivirus-card-dropdown>
      </Host>
    );
  }

  renderStatus = () => {
    return this.scanning ? (
      <div style={{ display: 'flex' }}>
        <p class="before-check">{this.t.msg(['PREVIEW', 'WAIT_CHECK'])}</p>
        <div class="antivirus-card-preview__spinner">
          <antivirus-card-spinner-round />
        </div>
      </div>
    ) : (
        <p class="before-check">
          {this.t.msg(['PREVIEW', 'LAST_CHECK'])} {this.lastScan}
        </p>
      );
  };

  renderScheduleMessage = () => {
    return this.hasScheduledActions ? (
      <p class="next-check">
        {this.t.msg(['PREVIEW', 'NEXT_CHECK'])}
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
    return (
      <div class="antivirus-card-preview__container">
        <VirusesCheckBadIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>
            {this.t.msg(['PREVIEW', 'INFECTED_FILES_WORD_1'], infectedFilesCount)} {infectedFilesCount}{' '}
            {this.t.msg(['PREVIEW', 'INFECTED_FILES_WORD_2'], infectedFilesCount)}
          </span>
          <div style={{ display: 'inline' }}>
            <a class="link link_small link_indent-right" onClick={this.disinfectVirusFiles.bind(this)}>
              {this.t.msg(['PREVIEW', 'CURE'])}
            </a>
            <a class="link link_small" onClick={() => this.clickItem.emit(1)}>
              {this.t.msg(['PREVIEW', 'DETAIL'])}
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
          <span>{this.t.msg(['PREVIEW', 'NOT_INFECTED_FILES'])}</span>
        </div>
      </div>
    );
  };

  renderInBlackLists = () => {
    return (
      <div class="antivirus-card-preview__container">
        <CheckListBadIcon />
        <div class="antivirus-card-preview__container-msg">
          <span>{this.t.msg(['PREVIEW', 'IN_BLACK_LISTS'])}</span>
          <div style={{ display: 'inline' }}>
            <a onClick={this.handleBlackListsHelpClick.bind(this)} class="link link_small">
              {this.t.msg(['PREVIEW', 'HOW_TO_FIX'])}
            </a>
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
          <span>{this.t.msg(['PREVIEW', 'NOT_IN_BLACK_LISTS'])}</span>
        </div>
      </div>
    );
  };
}
