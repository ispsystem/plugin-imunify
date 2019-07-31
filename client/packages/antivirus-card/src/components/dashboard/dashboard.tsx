import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { ITranslate } from '../../models/translate.reducers';
import { PreviewFree } from '../preview/PreviewFree';
import { PreviewNewScan } from '../preview/PreviewNewScan';
import { AntivirusState } from '../../models/antivirus/state';

/**
 * Dashboard component for antivirus-card
 */
@Component({
  tag: 'antivirus-card-dashboard',
  styleUrl: 'styles/$.scss',
})
export class Dashboard {
  /** global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;

  /** open ImunifyAV+ buy modal */
  @Event() openBuyModal: EventEmitter;

  /** @todo: open new scan modal */
  @Event() openNewScanModal: EventEmitter;

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
          <PreviewNewScan onClick={() => this.openNewScanModal.emit()} text={this.t.msg(['NEW_SCAN_BTN'])}></PreviewNewScan>
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
