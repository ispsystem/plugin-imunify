import '@stencil/redux';

import { Component, h, Host, State, JSX, Listen, Prop, Watch } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState, Notifier, NotifierEvent } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { ProIcon } from './icons/pro';
import { TranslateActions } from '../models/translate.actions';
import { ITranslate } from '../models/translate.reducers';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { defaultLang, languageTypes, languages } from '../constants';
import { getNestedObject } from '../utils/tools';
import { AntivirusActions } from '../models/antivirus/actions';

/**
 * AntivirusCard component
 */
@Component({
  tag: 'antivirus-card',
  styleUrl: 'style.scss',
  shadow: true,
})
export class AntivirusCard {
  newScanModal: HTMLAntivirusCardModalElement;
  /** reference to modal element */
  buyModal: HTMLAntivirusCardModalElement;
  /** periods for PRO version */
  proPeriods;

  /** site ID from vepp */
  @Prop() siteId: number;
  /** global notifier object */
  @Prop() notifier: Notifier;
  /** main app translate service */
  @Prop() translateService: { currentLang: string; defaultLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  /** global store object */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** selected period */
  @State() selectedPeriod = 0;
  /** history list */
  @State() history: RootState['antivirus']['history'];
  /** scan option preset */
  @State() scanPreset: RootState['antivirus']['scanPreset'];
  /** scan in process */
  @State() scanning: RootState['antivirus']['scanning'];
  /** list current scan process */
  @State() scanTaskList$: RootState['antivirus']['scanTaskList$'];
  /** translate object */
  @State() t: ITranslate;
  /** nested components */
  @State()
  items: {
    label: string;
    active?: boolean;
    component: () => JSX.Element;
  }[];

  /**
   * Update messages when change translate object
   */
  @Watch('t')
  updateMessages(): void {
    this.proPeriods = [
      {
        msg: this.t.msg(['PRO_PERIODS', 'MONTH', 'LONG']),
        monthCost: `4.9 €/${this.t.msg(['PRO_PERIODS', 'MONTH', 'SHORT'])}`,
        fullCost: '4.9 €',
      },
      {
        msg: this.t.msg(['PRO_PERIODS', 'YEAR', 'LONG']),
        monthCost: `4.08 €/${this.t.msg(['PRO_PERIODS', 'MONTH', 'SHORT'])} ${this.t.msg(['PRO_PERIODS', 'YEAR', 'DESCRIPTION'])}`,
        fullCost: '49 €',
      },
    ];

    let activeIndex = 0;
    if (Array.isArray(this.items) && this.items.length > 0) {
      activeIndex = this.items.findIndex(item => item.active);
    }

    this.items = [
      {
        label: this.t.msg(['MENU_ITEMS', 'DASHBOARD']),
        component: () => <antivirus-card-dashboard />,
      },
      {
        label: this.t.msg(['MENU_ITEMS', 'INFECTED_FILES']),
        component: () => <antivirus-card-infected-files />,
      },
      {
        label: this.t.msg(['MENU_ITEMS', 'HISTORY']),
        component: () => <antivirus-card-history />,
      },
    ];

    this.items[activeIndex].active = true;
  }

  /**
   * Listening event to open buy modal
   */
  @Listen('openBuyModal')
  openBuyModal(): void {
    this.buyModal.toggle(true);
  }

  /**
   * Handle click by an item
   * @param e - event
   */
  @Listen('clickItem')
  handleClickItem(e: MouseEvent): void {
    const beforeIndex = this.items.findIndex(item => item.active);
    this.items[beforeIndex].active = false;
    this.items[e.detail].active = true;

    this.items = [...this.items];
  }

  /** Action scan */
  scanVirus: typeof AntivirusActions.scan;
  /** Method to get available antivirus features */
  checkFeatures: typeof AntivirusActions.feature;
  /** Method to get scan history */
  getScanHistory: typeof AntivirusActions.history;
  /** Method to get infected files list */
  getInfectedFiles: typeof AntivirusActions.infectedFiles;
  /** Method to get setting presets */
  getSettingPresets: typeof AntivirusActions.scanSettingPresets;
  /** Method to update global state */
  updateState: typeof AntivirusActions.updateState;
  /** Method to wait a scan result */
  getScanResult: typeof AntivirusActions.getScanResult;
  /** Method to load translates from server */
  loadTranslate: typeof TranslateActions.load;

  async componentWillLoad(): Promise<void> {
    this.store.setStore(
      configureStore({
        siteId: this.siteId,
        notifier: this.notifier,
      }),
    );

    this.store.mapStateToProps(this, state => ({
      ...state.antivirus,
      t: state.translate,
    }));

    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan,
      checkFeatures: AntivirusActions.feature,
      getScanHistory: AntivirusActions.history,
      getInfectedFiles: AntivirusActions.infectedFiles,
      getSettingPresets: AntivirusActions.scanSettingPresets,
      updateState: AntivirusActions.updateState,
      getScanResult: AntivirusActions.getScanResult,
      loadTranslate: TranslateActions.load,
    });

    // prettier-ignore
    await this.loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    if (this.translateService !== undefined) {
      this.translateService.onLangChange.subscribe(d => {
        if (d.lang in languages) {
          this.loadTranslate(d.lang);
        }
      });
    }

    await this.checkFeatures();

    await this.getSettingPresets(this.siteId);

    await this.getScanHistory(this.siteId);

    await this.getInfectedFiles(this.siteId);

    if (this.notifier !== undefined) {
      this.notifier
        .taskList$()
        .pipe(take(1))
        .subscribe((d: NotifierEvent[]) => {
          // wait all scanning process
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
            this.scanTaskList$.next([...this.scanTaskList$.getValue(), ...runningPluginTasks]);
          }
        });

      // subscribe to scan tasks
      this.notifier
        .ids(this.scanTaskList$.asObservable())
        .delete$()
        .subscribe((notify: { event: NotifierEvent }) => {
          this.getScanResult(notify);
        });

      /** @todo: need query from back has scanning now or has not */
      setTimeout(() => {
        if (this.history.length === 0 && !this.scanning) {
          this.scanVirus(this.scanPreset.full.id, this.siteId);
        }
      }, 700);
    }
  }

  /**
   * Handle to buy pro version
   */
  buyProVersion() {
    this.updateState({
      ...this.store.getState().antivirus,
      isProVersion: true,
    });

    this.buyModal.visible = false;
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
            <antivirus-card-button btn-theme="accent" onClick={this.buyProVersion.bind(this)}>
              {this.t.msg(['SUBSCRIBE_FOR'])} {this.proPeriods[this.selectedPeriod].fullCost}
            </antivirus-card-button>
            <a class="link link_indent-left" onClick={() => this.buyModal.toggle(false)}>
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
const LabelForBuyModal = (props: { pro?: boolean; text: string }) => (
  <div style={{ margin: '10px 0' }}>
    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>{props.pro ? <ProIcon /> : <FreeIcon />}</span>
    <span>{props.text}</span>
  </div>
);
