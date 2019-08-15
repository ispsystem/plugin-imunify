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
import { getNestedObject, getCurrencySymbol } from '../utils/tools';
import { AntivirusActions } from '../models/antivirus/actions';
import { UserNotification } from '../redux/user-notification.interface';
import { AntivirusState } from '../models/antivirus/state';

/** Enumirable for card pages */
enum AntivirusCardPages {
  dashboard = 'dashboard',
  infectedFiles = 'infectedFiles',
  history = 'history',
}

/**
 * Payment status returned by payment system
 */
type PaymentStatus = 'failed' | 'success';

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
  /** reference to the failed payment modal */
  failedPaymentModal: HTMLAntivirusCardModalElement;
  /** site ID from vepp */
  @Prop() siteId: number;
  /** global notifier object */
  @Prop() notifier: Notifier;
  /** Global user notification service */
  @Prop() userNotification: UserNotification;
  /** main app translate service */
  @Prop() translateService: { currentLang: string; defaultLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  /** global store object */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** selected period */
  @State() selectedPeriod = 0;
  /** history list */
  @State() historyItemCount: RootState['antivirus']['historyItemCount'];
  /** scan option preset */
  @State() scanPreset: RootState['antivirus']['scanPreset'];
  /** scan in process */
  @State() scanning: RootState['antivirus']['scanning'];
  /** list current scan process */
  @State() taskList$: RootState['antivirus']['taskList$'];
  /** Price list for buy pro version */
  @State() priceList: AntivirusState['priceList'];
  /** translate object */
  @State() t: ITranslate;
  /** nested components */
  @State()
  items: {
    name: AntivirusCardPages;
    label: string;
    active?: boolean;
    component: () => JSX.Element;
  }[];

  /**
   * Update messages when change translate object
   */
  @Watch('t')
  updateMessages(): void {
    let activeIndex = 0;
    if (Array.isArray(this.items) && this.items.length > 0) {
      activeIndex = this.items.findIndex(item => item.active);
    }

    this.items = [
      {
        name: AntivirusCardPages.dashboard,
        label: this.t.msg(['MENU_ITEMS', 'DASHBOARD']),
        component: () => <antivirus-card-dashboard />,
      },
      {
        name: AntivirusCardPages.infectedFiles,
        label: this.t.msg(['MENU_ITEMS', 'INFECTED_FILES']),
        component: () => <antivirus-card-infected-files />,
      },
      {
        name: AntivirusCardPages.history,
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
  /** Method for removing removed files from infected files list */
  deleteFilesPostProcess: typeof AntivirusActions.deleteFilesPostProcess;
  /** Method for get price list by plugin */
  getPriceList: typeof AntivirusActions.getPriceList;

  async componentWillLoad(): Promise<void> {
    this.store.setStore(
      configureStore({
        siteId: this.siteId,
        notifier: this.notifier,
        userNotification: this.userNotification,
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
      deleteFilesPostProcess: AntivirusActions.deleteFilesPostProcess,
      getPriceList: AntivirusActions.getPriceList,
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

    await Promise.all([
      this.checkFeatures(),
      this.getSettingPresets(this.siteId),
      this.getScanHistory(this.siteId),
      this.getInfectedFiles(this.siteId),
      /** @todo may be get price list for only free version */
      this.getPriceList(),
    ]);

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
            this.taskList$.next([...this.taskList$.getValue(), ...runningPluginTasks]);
          }
        });

      // subscribe to tasks
      this.notifier
        .ids(this.taskList$.asObservable())
        .delete$()
        .subscribe((notify: { event: NotifierEvent }) => {
          const taskName = notify.event.additional_data.name;
          switch (taskName) {
            case 'scan':
              this.getScanResult(notify, this.userNotification, this.t);
              break;

            case 'files':
              this.deleteFilesPostProcess(notify, this.userNotification, this.t);
              break;
          }
        });

      /** @todo: need query from back has scanning now or has not */
      setTimeout(() => {
        if (this.historyItemCount === 0 && !this.scanning) {
          this.scanVirus(this.scanPreset.full.id, this.siteId);
        }
      }, 1000);
    }

    // search page in query params
    const [defaultLocation, queryParam] = location.toString().split('?');
    if (Boolean(queryParam)) {
      const searchParams = new URLSearchParams(queryParam);
      if (searchParams.has('page')) {
        const index = this.items.findIndex(i => i.name === searchParams.get('page'));
        const beforeIndex = this.items.findIndex(item => item.active);

        if (index > -1 && beforeIndex > -1 && index !== beforeIndex) {
          this.items[beforeIndex].active = false;
          this.items[index].active = true;
          this.items = [...this.items];
        }
        searchParams.delete('page');
      }
      history.replaceState({}, document.title, `${defaultLocation}${searchParams.toString() !== '' ? '?' + searchParams.toString() : ''}`);
    }
  }

  componentDidLoad() {
    /** @todo move this logic to different handlers */
    const [defaultLocation, queryParam] = location.toString().split('?');
    if (Boolean(queryParam)) {
      const searchParams = new URLSearchParams(queryParam);
      // search open modal in query params
      if (searchParams.has('openModal')) {
        switch (searchParams.get('openModal')) {
          case 'buyModal': {
            this.buyModal.toggle(true);
            break;
          }
        }
        searchParams.delete('openModal');
      }
      // Checks for the payment status and if it's passed and it equals 'failed' -- the expedient modal shows up
      else if (searchParams.has('payment')) {
        const paymentStatus = searchParams.get('payment') as PaymentStatus;
        if (paymentStatus === 'failed') {
          this.failedPaymentModal.toggle(true);
          searchParams.delete('payment');
        }
      }
      history.replaceState({}, document.title, `${defaultLocation}${searchParams.toString() !== '' ? '?' + searchParams.toString() : ''}`);
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
          <span class="title" style={{ display: 'block', 'margin-bottom': '20px' }}>
            {this.t.msg(['BUY_MODAL', 'TITLE'])}
          </span>
          {/* <antivirus-card-switcher style={{ display: 'block', marginTop: '20px' }}>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 0)} active>
              {this.proPeriods[0].msg}
            </antivirus-card-switcher-option>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 1)} last>
              {this.proPeriods[1].msg}
            </antivirus-card-switcher-option>
          </antivirus-card-switcher> */}
          {/* <p style={{ marginBottom: '30px' }}>{this.proPeriods[this.selectedPeriod].monthCost}</p> */}
          <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_1'])} />
          <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_2'])} />
          {/* <LabelForBuyModal text={this.t.msg(['BUY_MODAL', 'LABEL_3'])} /> */}
          <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_1'])} />
          {/* <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_2'])} /> */}
          {/* <LabelForBuyModal pro text={this.t.msg(['BUY_MODAL', 'LABEL_PRO_3'])} /> */}
          <div class="button-container">
            <antivirus-card-button btn-theme="accent" onClick={this.buyProVersion.bind(this)}>
              {this.t.msg(['SUBSCRIBE_FOR'], { cost: this.priceList[0].cost, currency: getCurrencySymbol(this.priceList[0].currency) })}
            </antivirus-card-button>
            <a class="link link_indent-left" onClick={() => this.buyModal.toggle(false)}>
              {this.t.msg(['NOT_NOW'])}
            </a>
          </div>
        </antivirus-card-modal>
        <antivirus-card-modal modal-width="370px" ref={el => (this.failedPaymentModal = el)}>
          <span class="title">{this.t.msg(['PAYMENT_FAILED_MODAL', 'TITLE'])}</span>
          <p>
            {this.t.msg(['PAYMENT_FAILED_MODAL', 'DESCRIPTION_1'])}
            <br />
            {this.t.msg(['PAYMENT_FAILED_MODAL', 'DESCRIPTION_2'])}
          </p>
          <div class="button-container">
            <antivirus-card-button btn-theme="accent" onClick={() => this.failedPaymentModal.toggle(false)}>
              {this.t.msg(['PAYMENT_FAILED_MODAL', 'TRY_AGAIN_BUTTON'])}
            </antivirus-card-button>
            <a class="link link_indent-left" onClick={() => this.failedPaymentModal.toggle(false)}>
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
