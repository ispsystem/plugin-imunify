import '@stencil/redux';

import { Component, h, Host, State, JSX, Listen, Prop } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState, INotifier, ISPNotifierEvent } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { AntivirusActions } from '../models/antivirus.actions';
import { ProIcon } from './icons/pro';
import { TranslateActions } from '../models/translate.actions';
import { ITranslate } from '../models/translate.reducers';
import { Observable } from 'rxjs';
import { defaultLang, languageTypes, languages } from '../constants';
import { getNestedObject } from '../utils/tools';

/**
 *
 * AntivirusCard component
 */
@Component({
  tag: 'antivirus-card',
  styleUrl: 'style.scss',
  shadow: true
})
export class AntivirusCard {
  /** reference to modal element */
  public buyModal: HTMLAntivirusCardModalElement;
  /** periods for PRO version */
  public proPeriods;

  /** selected period */
  @State()
  selectedPeriod = 0;
  /** translate object */
  @State()
  t: ITranslate;

  /** nested components */
  @State()
  items: {
    label: string;
    active: boolean;
    component: () => JSX.Element;
  }[];

  @Prop() notifier: INotifier;
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };

  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  checkFeatures: typeof AntivirusActions.feature;
  updateState: typeof AntivirusActions.updateState;
  waitScanResult: typeof AntivirusActions.waitScanResult;
  loadTranslate: typeof TranslateActions.load;

  async componentWillLoad() {
    this.store.setStore(
      configureStore({
        notifier: this.notifier,
      })
    );

    this.store.mapStateToProps(this, state => ({
      t: state.translate
    }));

    this.store.mapDispatchToProps(this, {
      checkFeatures: AntivirusActions.feature,
      updateState: AntivirusActions.updateState,
      waitScanResult: AntivirusActions.waitScanResult,
      loadTranslate: TranslateActions.load
    });

    await this.loadTranslate(getNestedObject(this.translateService, ['currentLang']) || defaultLang);

    if (this.translateService) {
      this.translateService.onLangChange.subscribe(d => {
        if (d.lang in languages) {
          this.loadTranslate(d.lang);
        }
      });
    }

    await this.checkFeatures();

    if (this.notifier) {
      this.notifier.taskList$().subscribe((d: ISPNotifierEvent[]) => {
        if (d && Array.isArray(d) && d.length > 0) {
          const runningPluginTasks = d
            .map(n => {
              if (
                n.additional_data &&
                (n.additional_data.status === 'created' ||
                  n.additional_data.status === 'running' ||
                  n.additional_data.status === 'deferred')
              ) {
                return n.id;
              }
            })
            .filter(id => id !== undefined);
          if (runningPluginTasks.length > 0) {
            this.waitScanResult(this.notifier, runningPluginTasks);
          }
        }
      });
    }

    this.proPeriods = [
      {
        msg: this.t.msg(['PRO_PERIODS', 'MONTH', 'LONG']),
        monthCost: `4.9 €/${this.t.msg(['PRO_PERIODS', 'MONTH', 'SHORT'])}`,
        fullCost: '4.9 €'
      },
      {
        msg: this.t.msg(['PRO_PERIODS', 'YEAR', 'LONG']),
        monthCost: `4.08 €/${this.t.msg(['PRO_PERIODS', 'MONTH', 'SHORT'])} ${this.t.msg(['PRO_PERIODS', 'YEAR', 'DESCRIPTION'])}`,
        fullCost: '49 €'
      }
    ];

    this.items = [
      {
        label: this.t.msg(['MENU_ITEMS', 'PREVIEW']),
        active: true,
        component: () => <antivirus-card-preview />
      },
      {
        label: this.t.msg(['MENU_ITEMS', 'INFECTED_FILES']),
        active: false,
        component: () => <antivirus-card-infected-files />
      },
      {
        label: this.t.msg(['MENU_ITEMS', 'HISTORY']),
        active: false,
        component: () => <antivirus-card-history />
      }
    ];
  }

  /**
   * Listening event to open buy modal
   */
  @Listen('openBuyModal')
  openBuyModal() {
    this.buyModal.visible = true;
  }

  /**
   * Handle click by an item
   * @param e - event
   */
  @Listen('clickItem')
  handleClickItem(e: MouseEvent) {
    const beforeIndex = this.items.findIndex(item => item.active);
    this.items[beforeIndex].active = false;
    this.items[e.detail].active = true;

    this.items = [...this.items];
  }

  render() {
    return (
      <Host>
        <h2 class="title">{this.t.msg(['TITLE'])}</h2>
        <antivirus-card-navigation items={this.items} />
        {this.items.find(item => item.active).component()}
        <antivirus-card-modal modal-width="370px" ref={el => (this.buyModal = el)}>
          <span class="title">{this.t.msg(['BUY_MODAL', 'TITLE'])}</span>
          <antivirus-card-switcher style={{ display: 'block', marginTop: '20px' }}>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 0)} active>
              {this.proPeriods[0].msg}
            </antivirus-card-switcher-option>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 1)} last>
              {this.proPeriods[1].msg}
            </antivirus-card-switcher-option>
          </antivirus-card-switcher>
          <p style={{ marginBottom: '30px' }}>{this.proPeriods[this.selectedPeriod].monthCost}</p>
          <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_1'])} />
          <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_2'])} />
          <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_3'])} />
          <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_1'])} />
          <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_2'])} />
          <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_3'])} />
          <div class="button-container">
            <antivirus-card-button btn-theme="accent" onClick={() => (this.buyModal.visible = false)}>
              {this.t.msg(['SUBSCRIBE_FOR'])} {this.proPeriods[this.selectedPeriod].fullCost}
            </antivirus-card-button>
            <a class="link link_indent-left" onClick={() => (this.buyModal.visible = false)}>
              {this.t.msg(['NOT_NOW'])}
            </a>
          </div>
        </antivirus-card-modal>
      </Host>
    );
  }
}

/**
 *
 * LabelForBuyModal Functional Components
 * @param props - properties
 */
const LabelForBuyModal = props => (
  <div style={{ margin: '10px 0' }}>
    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>{props.pro ? <ProIcon /> : <FreeIcon />}</span>
    <span>{props.text}</span>
  </div>
);
