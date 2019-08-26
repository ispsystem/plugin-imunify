import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter, Listen } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { ITranslate } from '../../models/translate.reducers';
import { PreviewNewScan } from '../preview/PreviewNewScan';
import { AntivirusState, ScanOption } from '../../models/antivirus/state';
import { MOCK } from '../../utils/mock';
import { PreviewPurchase } from '../preview/PreviewPurchase';
import { getCurrencySymbol, getShortPeriod } from '../../utils/tools';
import { PreviewFree } from '../preview/PreviewFree';

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
  /** Preset object for scanning */
  @State() scanPreset: AntivirusState['scanPreset'];
  /** Price list for pro version */
  @State() priceList: AntivirusState['priceList'];
  /** flag if antivirus in purchasing status */
  @State() purchasing: AntivirusState['purchasing'];

  /** Scan in process */
  @State() scanning: AntivirusState['scanning'];

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
        {this.isProVersion && Boolean(this.scanPreset.partial) && (
          <antivirus-card-button
            isDisabled={this.scanning}
            class="header-button new-scan-button"
            btn-theme="third"
            onClick={ev => (this.scanning ? ev.preventDefault() : this.newScanModal.toggle(true))}
          >
            {this.t.msg(['NEW_SCAN_BTN'])}
          </antivirus-card-button>
        )}
        <antivirus-card-preview scanType="FULL" />
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
              <antivirus-card-preview scanType="PARTIAL" />
            ) : (
              <PreviewNewScan onClick={() => this.newScanModal.toggle(true)} text={this.t.msg(['NEW_SCAN_BTN'])} />
            ),
          ]
        ) : this.purchasing ? (
          <PreviewPurchase t={this.t} />
        ) : (
          <PreviewFree
            onClick={() => this.openBuyModal.emit()}
            title={
              this.priceList
                ? this.t.msg(['DASHBOARD', 'TITLE'], {
                    cost: this.priceList.price[0].cost,
                    currency: getCurrencySymbol(this.priceList.price[0].currency),
                    period: getShortPeriod(this.priceList.price[0].type, this.t),
                  })
                : ''
            }
            /** @todo uncomment if UX decides to return the description for the purchase */
            // text={this.t.msg(['DASHBOARD', 'TEXT'])}
          />
        )}
      </Host>
    );
  }
}
