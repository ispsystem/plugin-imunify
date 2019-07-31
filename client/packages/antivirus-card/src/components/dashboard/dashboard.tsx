import '@stencil/redux';

import { Component, h, Host, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { ITranslate } from '../../models/translate.reducers';
import { PreviewFree } from '../preview/PreviewFree';

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
  /** translate object */
  @State() t: ITranslate;
  /** open ImunifyAV+ buy modal */
  @Event() openBuyModal: EventEmitter;

  /**
   * Lifecycle event
   */
  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ t: state.translate }));
  }

  render() {
    return (
      <Host>
        <antivirus-card-preview></antivirus-card-preview>
        <PreviewFree
          onClick={() => this.openBuyModal.emit()}
          title={this.t.msg(['DASHBOARD', 'TITLE'])}
          text={this.t.msg(['DASHBOARD', 'TEXT'])}
        ></PreviewFree>
      </Host>
    );
  }
}
