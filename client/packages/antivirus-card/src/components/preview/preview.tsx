import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { StartCheckIcon } from '../icons/start-check';
import { LockIcon } from '../icons/lock';
import { Store } from '@stencil/redux';
import { RootState, Notifier } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { getDayMonthYearAsStr, getTimeAsStr } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { AntivirusState, CheckType, ScanOption } from '../../models/antivirus/state';
import { AntivirusActions } from '../../models/antivirus/actions';
import { PreviewStatus } from './PreviewStatus';
import { PreviewInfectedFiles } from './PreviewInfectedFiles';
import { CloseIcon } from '../icons/close';

/**
 * Preview component for antivirus-card
 */
@Component({
  tag: 'antivirus-card-preview',
  styleUrl: 'styles/$.scss',
})
export class Preview {
  /** ref for dropdown element */
  // dropdownEl: HTMLAntivirusCardDropdownElement;

  /** global stile */
  @Prop({ context: 'store' })
  store: Store<RootState, ActionTypes>;

  /** scan type for this card */
  @Prop()
  scanType: CheckType = 'FULL';

  /** scan loading */
  @State() scanning: AntivirusState['scanning'];
  /** flag has schedule */
  @State() hasScheduledActions: AntivirusState['hasScheduledActions'];
  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** list infected files */
  @State() infectedFilesCount: AntivirusState['infectedFilesCount'];
  /** flag if a domain is in black lists */
  @State() inBlackLists: AntivirusState['inBlackLists'];
  /** history list */
  @State() lastScan: AntivirusState['lastScan'];
  /** global notifier object */
  @State() notifier: Notifier;
  /** translate object */
  @State() t: ITranslate;
  /** Site id */
  @State() siteId: number;
  /** scan option preset */
  @State() scanPreset: RootState['antivirus']['scanPreset'];
  /** user notification's provider */
  @State() userNotification: RootState['userNotification'];

  /** to open buy modal */
  @Event() openBuyModal: EventEmitter;

  /** to open scan settings modal */
  @Event() openScanSettingsModal: EventEmitter;

  /** to change selected tab item (horizontal menu) */
  @Event({
    bubbles: true,
    composed: true,
  })
  clickItem: EventEmitter;

  /**
   * scan option for this card
   */
  get scanOption(): ScanOption {
    return this.scanType === 'PARTIAL' ? this.scanPreset.partial : this.scanPreset.full;
  }

  /** Action scan */
  scanVirus: typeof AntivirusActions.scan;

  /** Action disable preset */
  disablePreset: typeof AntivirusActions.disablePreset;

  /** Reference to delete files action */
  cureFiles: typeof AntivirusActions.cureFiles;

  /**
   * Lifecycle
   */
  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({
      ...state.antivirus,
      notifier: state.notifier,
      t: state.translate,
      siteId: state.siteId,
    }));
    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan,
      disablePreset: AntivirusActions.disablePreset,
      cureFiles: AntivirusActions.cureFiles,
    });
  }

  /**
   * Method for disable preset
   */
  async handleDisablePreset() {
    await this.disablePreset(this.scanOption.id);
  }

  /**
   * Handle click to black list help link
   *
   * @param ev - mouse click
   */
  // handleBlackListsHelpClick(ev: MouseEvent) {
  //   this.dropdownEl.toggle(ev);
  // }

  /**
   * Method return infected files count
   */
  getInfectedFilesCount(): number {
    return this.scanType === 'PARTIAL'
      ? this.lastScan.partial
        ? this.lastScan.partial.infectedFilesCount - this.lastScan.partial.curedFilesCount
        : 0
      : this.infectedFilesCount;
  }

  /**
   * Calls the file curing handler
   */
  async heal(): Promise<void> {
    await this.cureFiles(this.siteId, [], this.userNotification, this.t);
  }

  render() {
    return (
      <Host>
        {this.scanType === 'PARTIAL' && (
          <div style={{ position: 'absolute', right: '20px', cursor: 'pointer' }} onClick={() => this.handleDisablePreset()}>
            <CloseIcon />
          </div>
        )}
        <PreviewStatus
          msgWaitCheck={this.t.msg(['PREVIEW', 'WAIT_CHECK'])}
          msgLastCheck={this.t.msg(['PREVIEW', 'LAST_CHECK'])}
          lastScan={
            this.scanType === 'PARTIAL'
              ? this.lastScan.partial &&
                this.t.msg(['LAST_CHECK_IN'], {
                  date: getDayMonthYearAsStr(new Date(this.lastScan.partial.date)),
                  time: getTimeAsStr(new Date(this.lastScan.partial.date)),
                })
              : this.lastScan.full &&
                this.t.msg(['LAST_CHECK_IN'], {
                  date: getDayMonthYearAsStr(new Date(this.lastScan.full.date)),
                  time: getTimeAsStr(new Date(this.lastScan.full.date)),
                })
          }
          scanning={this.scanning}
        />

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
          infectedFilesCount={this.getInfectedFilesCount()}
          isProVersion={this.isProVersion}
          openBuyModal={this.openBuyModal}
          healHandler={this.heal.bind(this)}
        />

        {/** @todo: return when imunify released this feature */
        /*
        <PreviewInBlackLists
          t={this.t}
          inBlackLists={this.inBlackLists}
          dropdownElToggle={this.handleBlackListsHelpClick.bind(this)}
        ></PreviewInBlackLists>
        */}
        {/** @todo change presetId parameter */}
        <div style={{ display: 'flex', 'align-items': 'center', 'margin-top': '25px', height: '28px' }}>
          <span class={this.scanning ? 'link-disabled' : 'link'}>
            <StartCheckIcon
              onClick={() => this.scanVirus(this.scanOption.id, this.siteId)}
              disabled={this.scanning}
              btnLabel={this.t.msg('BTN_SCAN')}
            />
          </span>
          {this.isProVersion && !this.scanning && (
            <a class="link" onClick={() => this.openScanSettingsModal.emit(this.scanOption)} style={{ 'margin-left': '20px' }}>
              {this.t.msg('CONFIGURE')}
            </a>
          )}
        </div>

        {/* <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => (this.dropdownEl = el)}>
          <p style={{ margin: '0' }}>{this.t.msg(['PREVIEW', 'HELP'])}</p>
          <p style={{ margin: '20px 0 0 0' }}>{this.t.msg(['PREVIEW', 'HELP_RECOMMENDATION'])}</p>
        </antivirus-card-dropdown> */}
      </Host>
    );
  }
}
