import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter, Listen } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { ITranslate } from '../../models/translate.reducers';
import { PreviewFree } from '../preview/PreviewFree';
import { PreviewNewScan } from '../preview/PreviewNewScan';
import { AntivirusState, ScanOption } from '../../models/antivirus/state';
import { MOCK } from '../../utils/mock';

/**
 * Dashboard component for antivirus-card
 */
@Component({
  tag: 'antivirus-card-dashboard',
  styleUrl: 'styles/$.scss',
})
export class Dashboard {
  /** Ref for new scan modal */
  newScanModal: HTMLAntivirusCardModalElement;

  /** Ref for scan settings modal */
  scanSettingsModal: HTMLAntivirusCardModalElement;

  /** Ref for scan settings component */
  scanSettings: HTMLAntivirusCardScanSettingsElement;

  /**
   *  Its Mock DATA
   *  @todo delete after realise handle for get default preset
   */
  preset: ScanOption = MOCK.defaultPreset;

  /** global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;

  @State() scanPreset: AntivirusState['scanPreset'];

  /** open ImunifyAV+ buy modal */
  @Event() openBuyModal: EventEmitter<ScanOption>;

  /**
   * Open scan setting modal
   *
   * @param event - custom event
   */
  @Listen('openScanSettingsModal')
  openSettingModal(event: CustomEvent<ScanOption>) {
    this.scanSettings.setPreset(event.detail);
    this.scanSettingsModal.toggle(true);
  }

  /**
   * Lifecycle event
   */
  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate }));
  }

  render() {
    return (
      <Host>
        <antivirus-card-preview></antivirus-card-preview>
        {this.isProVersion ? (
          [
            <antivirus-card-modal modal-width={`${640 - 50}px`} ref={el => (this.newScanModal = el)}>
              <antivirus-card-new-scan preset={this.preset} closeModal={() => this.newScanModal.toggle(false)}>
                <span class="title" slot="title">
                  {this.t.msg(['SCAN_SETTINGS', 'NEW_SCAN'])}
                </span>
              </antivirus-card-new-scan>
            </antivirus-card-modal>,
            <antivirus-card-modal modal-width={`${640 - 50}px`} ref={el => (this.scanSettingsModal = el)}>
              <antivirus-card-scan-settings ref={el => (this.scanSettings = el)} closeModal={() => this.scanSettingsModal.toggle(false)}>
                <span class="title" slot="title">
                  {this.t.msg(['SCAN_SETTINGS', 'NEW_SCAN'])}
                </span>
              </antivirus-card-scan-settings>
            </antivirus-card-modal>,
            this.scanPreset && this.scanPreset.partial ? (
              <antivirus-card-preview scanType="PARTIAL"></antivirus-card-preview>
            ) : (
              <PreviewNewScan onClick={() => this.newScanModal.toggle(true)} text={this.t.msg(['NEW_SCAN_BTN'])}></PreviewNewScan>
            ),
          ]
        ) : (
          <PreviewFree
            onClick={() => this.openBuyModal.emit()}
            title={this.t.msg(['DASHBOARD', 'TITLE'])}
            text={this.t.msg(['DASHBOARD', 'TEXT'])}
          ></PreviewFree>
        )}
      </Host>
    );
  }
}
