import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter, Watch } from '@stencil/core';
import { StartCheckIcon } from '../icons/start-check';
import { LockIcon } from '../icons/lock';
import { Store } from '@stencil/redux';
import { RootState, Notifier } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { pad } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { AntivirusState } from '../../models/antivirus/state';
import { AntivirusActions } from '../../models/antivirus/actions';
import { PreviewStatus } from './PreviewStatus';
import { PreviewInfectedFiles } from './PreviewInfectedFiles';
import { PreviewInBlackLists } from './PreviewInBlackLists';

/**
 * Preview component for antivirus-card
 */
@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss',
})
export class Preview {
  /** ref for dropdown element */
  private _dropdownEl!: HTMLAntivirusCardDropdownElement;

  /** global stile */
  @Prop({ context: 'store' })
  store: Store<RootState, ActionTypes>;

  /** scan loading */
  @State() scanning: AntivirusState['scanning'];
  /** flag has schedule */
  @State() hasScheduledActions: AntivirusState['hasScheduledActions'];
  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** list infected files */
  @State() infectedFiles: AntivirusState['infectedFiles'];
  /** flag if a domain is in black lists */
  @State() inBlackLists: AntivirusState['inBlackLists'];
  /** history list */
  @State() history: AntivirusState['history'];
  /** global notifier object */
  @State() notifier: Notifier;
  /** translate object */
  @State() t: ITranslate;
  /** last scan date as string */
  @State() lastScan: string;

  /** to open buy modal */
  @Event() openBuyModal: EventEmitter;
  /** to change selected tab item (horizontal menu) */
  @Event({
    bubbles: true,
    composed: true,
  })
  clickItem: EventEmitter;

  /**
   * Change last scan date
   *
   * @param newValue - new history
   */
  @Watch('history')
  setLastScan(newValue: AntivirusState['history']) {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const date = newValue[newValue.length - 1].date;
      this.lastScan = `${this.getDayMonthYearAsStr(new Date(date))} в ${this.getTimeAsStr(new Date(date))}`;
    }
  }

  /** Action scan */
  scanVirus: typeof AntivirusActions.scan;

  /**
   * Lifecycle
   */
  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, notifier: state.notifier, t: state.translate }));
    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan,
    });

    this.setLastScan(this.history);
  }

  /**
   * Get day, month and year from Data
   *
   * @param date - date obj
   */
  getDayMonthYearAsStr(date: Date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  /**
   * Get time from Date
   *
   * @param date - date obj
   */
  getTimeAsStr(date: Date) {
    return `${date.getHours()}.${pad(date.getMinutes())}`;
  }

  /**
   * Handle click to black list help link
   *
   * @param ev - mouse click
   */
  handleBlackListsHelpClick(ev: MouseEvent) {
    this._dropdownEl.toogle(ev);
  }

  render() {
    return (
      <Host>
        <PreviewStatus
          msgWaitCheck={this.t.msg(['PREVIEW', 'WAIT_CHECK'])}
          msgLastCheck={this.t.msg(['PREVIEW', 'LAST_CHECK'])}
          lastScan={this.lastScan}
          scanning={this.scanning}
        ></PreviewStatus>

        {this.hasScheduledActions ? (
          <p class="next-check">
            {this.t.msg(['PREVIEW', 'NEXT_CHECK'])}
            <span style={{ 'margin-left': '5px', 'vertical-align': 'middle' }}>
              <LockIcon />
            </span>
          </p>
        ) : null}

        <PreviewInfectedFiles
          t={this.t}
          clickItem={this.clickItem}
          infectedFilesCount={Array.isArray(this.infectedFiles) ? this.infectedFiles.length : 0}
          isProVersion={this.isProVersion}
          openBuyModal={this.openBuyModal}
        ></PreviewInfectedFiles>

        <PreviewInBlackLists
          t={this.t}
          inBlackLists={this.inBlackLists}
          dropdownElToggle={this.handleBlackListsHelpClick.bind(this)}
        ></PreviewInBlackLists>

        <div class="link" onClick={() => this.scanVirus(this.notifier)} style={{ 'margin-top': '25px', height: '28px' }}>
          <StartCheckIcon btnLabel={this.t.msg('NEW_SCAN_BTN')} />
        </div>

        <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => (this._dropdownEl = el)}>
          <p style={{ margin: '0' }}>{this.t.msg(['PREVIEW', 'HELP'])}</p>
          <p style={{ margin: '20px 0 0 0' }}>{this.t.msg(['PREVIEW', 'HELP_RECOMMENDATION'])}</p>
        </antivirus-card-dropdown>
      </Host>
    );
  }
}
