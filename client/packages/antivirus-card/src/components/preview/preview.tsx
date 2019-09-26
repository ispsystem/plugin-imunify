import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { StartCheckIcon } from '../icons/start-check';
import { LockIcon } from '../icons/lock';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Translate } from '../../models/translate.reducers';
import { AntivirusState, CheckType, ScanOption } from '../../models/antivirus/state';
import { AntivirusActions } from '../../models/antivirus/actions';
import { PreviewStatus } from './PreviewStatus';
import { PreviewInfectedFiles } from './PreviewInfectedFiles';
import { CloseIcon } from '../icons/close';
import { ISPNotifier } from '@ispsystem/notice-tools';

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
  @Prop() scanType: CheckType = 'FULL';

  /** scan loading */
  @State() scanning: AntivirusState['scanning'];
  /** Healing in process */
  @State() healing: AntivirusState['healing'];
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
  @State() notifier: ISPNotifier;
  /** translate object */
  @State() t: Translate;
  /** Site id */
  @State() siteId: number;
  /** scan option preset */
  @State() scanPreset: RootState['antivirus']['scanPreset'];
  /** user notification's provider */
  @State() userNotification: RootState['userNotification'];

  /** to open buy modal */
  @Event() openBuyModal: EventEmitter;

  /** to open scan settings modal */
  @Event() openScanSettingsModal: EventEmitter<{ preset: ScanOption; type: CheckType }>;

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
          <div
            style={{ position: 'absolute', right: '20px', cursor: this.scanning ? 'not-allowed' : 'pointer' }}
            onClick={ev => (this.scanning ? ev.preventDefault() : this.handleDisablePreset())}
          >
            <CloseIcon />
          </div>
        )}
        <PreviewStatus
          t={this.t}
          type={this.scanType}
          lastScanDate={
            this.scanType === 'PARTIAL'
              ? this.lastScan.partial && this.lastScan.partial.date
              : this.lastScan.full && this.lastScan.full.date
          }
          pathList={this.scanType === 'PARTIAL' ? this.scanOption.path : null}
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
          type={this.scanType}
          clickItem={this.clickItem}
          infectedFilesCount={this.getInfectedFilesCount()}
          isProVersion={this.isProVersion}
          openBuyModal={this.openBuyModal}
          healHandler={this.heal.bind(this)}
          healing={this.healing}
        />

        {/** @todo: return when imunify released this feature */
        /*
        <PreviewInBlackLists
          t={this.t}
          inBlackLists={this.inBlackLists}
          dropdownElToggle={this.handleBlackListsHelpClick.bind(this)}
        ></PreviewInBlackLists>
        */}
        <div style={{ display: 'flex', 'align-items': 'center', 'margin-top': '25px', height: '28px' }}>
          <span class={this.scanning ? 'link-disabled' : 'link'}>
            <StartCheckIcon
              onClick={() => this.scanVirus(this.scanOption.id, this.scanType, this.siteId)}
              disabled={this.scanning !== null}
              btnLabel={this.t.msg('BTN_SCAN')}
            />
          </span>
          {this.isProVersion && !this.scanning && (
            <a
              class="link"
              onClick={() => this.openScanSettingsModal.emit({ preset: this.scanOption, type: this.scanType })}
              style={{ 'margin-left': '20px' }}
            >
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
