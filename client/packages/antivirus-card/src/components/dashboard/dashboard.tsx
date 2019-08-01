import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { ITranslate } from '../../models/translate.reducers';
import { PreviewFree } from '../preview/PreviewFree';
import { PreviewNewScan } from '../preview/PreviewNewScan';
import { AntivirusState, ScanOption } from '../../models/antivirus/state';

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

  /**
   *  Its Mock DATA
   *  @TODO delete after realise handle for get default preset
   */
  preset: ScanOption = {
    id: 0,
    path: [],
    checkMask: [],
    excludeMask: [],
    intensity: 'LOW',
    scheduleTime: {
      single: {
        date: 1,
      },
    },
    checkFileTypes: 'CRITICAL',
    saveCopyFilesDay: 31,
    cureFoundFiles: true,
    removeInfectedFileContent: true,
    checkDomainReputation: false,
    parallelChecks: 1,
    ramForCheck: 1024,
    fullLogDetails: true,
    maxScanTime: 1,
    autoUpdate: true,
    docroot: 'www/example.com',
    email: 'hehe@lol.kek',
  };

  /** global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;

  @State() scanPreset: AntivirusState['scanPreset'];

  /** open ImunifyAV+ buy modal */
  @Event() openBuyModal: EventEmitter;

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
            <antivirus-card-modal modal-width={`${640 - 50}px`} ref={(el: HTMLAntivirusCardModalElement) => (this.newScanModal = el)}>
              <antivirus-card-new-scan preset={this.preset} closeModal={() => this.newScanModal.toggle(false)}>
                <span class="title" slot="title">
                  {this.t.msg(['SCAN_SETTINGS', 'NEW_SCAN'])}
                </span>
              </antivirus-card-new-scan>
            </antivirus-card-modal>,
            this.scanPreset && this.scanPreset.partial ? (
              <antivirus-card-preview></antivirus-card-preview>
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
