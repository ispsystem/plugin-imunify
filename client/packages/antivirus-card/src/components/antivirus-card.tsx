import '@stencil/redux';

import { Component, h, State, Listen, Prop, Watch, Host } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState, Notifier, NotifierEvent } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { ProIcon } from './icons/pro';
import { TranslateActions } from '../models/translate.actions';
import { ITranslate } from '../models/translate.reducers';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { defaultLang, languageTypes, languages } from '../constants';
import { getNestedObject, getCurrencySymbol, configureNotifier } from '../utils/tools';
import { AntivirusActions } from '../models/antivirus/actions';
import { UserNotification } from '../redux/user-notification.interface';
import { TaskEventName, NavigationItem, AntivirusCardPages, PaymentStatus } from '../models/antivirus/model';
import { AntivirusState } from '../models/antivirus/state';
import { purchase } from '../utils/controllers';

/**
 * AntivirusCard component
 */
@Component({
  tag: 'antivirus-card',
  styleUrl: 'style.scss',
  shadow: true,
})
export class AntivirusCard {
  /** RXJS subscription */
  sub = new Subscription();
  /** first loading flag */
  isPreloader = { card: true };

  newScanModal: HTMLAntivirusCardModalElement;

  /** reference to modal element */
  buyModal: HTMLAntivirusCardModalElement;
  /** reference to the failed payment modal */
  failedPaymentModal: HTMLAntivirusCardModalElement;
  /** plugin ID from vepp */
  @Prop() pluginId: number;
  /** site ID from vepp */
  @Prop() siteId: number;
  /** global notifier object */
  @Prop() notifierService: Notifier;
  /** Global user notification service */
  @Prop() userNotification: UserNotification;
  /** main app translate service */
  @Prop() translateService: { currentLang: string; defaultLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  /** global store object */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** selected period */
  @State() selectedPeriod = 0;
  /** scan option preset */
  @State() scanPreset: RootState['antivirus']['scanPreset'];
  /** scan in process */
  @State() scanning: RootState['antivirus']['scanning'];
  /** purchase in process */
  @State() purchasing: RootState['antivirus']['purchasing'];
  /** list current scan process */
  @State() taskList$: RootState['antivirus']['taskList$'];
  /** History item count of scanning */
  @State() historyItemCount: AntivirusState['historyItemCount'];
  /** Price list for buy pro version */
  @State() priceList: AntivirusState['priceList'];
  /** translate object */
  @State() t: ITranslate;
  /** nested components */
  @State() items: NavigationItem[];

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
        hidden: !Boolean(this.historyItemCount),
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

  /**
   * Update status for navigation item history, if history count change
   *
   * @param count - new history item count
   */
  @Watch('historyItemCount')
  lastScanChange(count: number) {
    if (Array.isArray(this.items)) {
      const historyTabIndex = this.items.findIndex(item => item.name === AntivirusCardPages.history);
      if (historyTabIndex !== undefined && historyTabIndex > -1) {
        this.items = this.items.map((item, index) => {
          if (index === historyTabIndex) {
            item.hidden = count === 0;
          }
          return item;
        });
      }
    }
  }

  /** Action scan */
  scanVirus: typeof AntivirusActions.scan;
  /** Method to get available antivirus features */
  checkFeatures: typeof AntivirusActions.feature;
  /** Method to get scan history */
  getLastScan: typeof AntivirusActions.getLastScan;
  /** Method to get infected files list */
  getInfectedFiles: typeof AntivirusActions.getInfectedFiles;
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
  /** Method for removing cured files from infected files list */
  cureFilesPostProcess: typeof AntivirusActions.cureFilesPostProcess;
  /** Method for get price list by plugin */
  getPriceList: typeof AntivirusActions.getPriceList;

  /**
   * LIFECYCLE
   * Init global store and subscribe to notifications
   */
  async componentWillLoad(): Promise<void> {
    this.store.setStore(
      configureStore({
        siteId: this.siteId,
        pluginId: this.pluginId,
        notifier: this.notifierService,
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
      getLastScan: AntivirusActions.getLastScan,
      getInfectedFiles: AntivirusActions.getInfectedFiles,
      getSettingPresets: AntivirusActions.scanSettingPresets,
      updateState: AntivirusActions.updateState,
      getScanResult: AntivirusActions.getScanResult,
      loadTranslate: TranslateActions.load,
      deleteFilesPostProcess: AntivirusActions.deleteFilesPostProcess,
      getPriceList: AntivirusActions.getPriceList,
      cureFilesPostProcess: AntivirusActions.cureFilesPostProcess,
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

    if (this.notifierService !== undefined) {
      this.notifierService
        .getTaskList('plugin', this.pluginId, 'task', '*')
        .pipe(take(1))
        .subscribe({
          next: async (notifyEvents: NotifierEvent[]) => {
            console.log('TASK LIST', notifyEvents);
            const runningTask = notifyEvents.find(event => ['running'].includes(getNestedObject(event, ['additional_data', 'status'])));
            if (runningTask !== undefined && runningTask.additional_data.name === TaskEventName.scan) {
              this.updateState({
                ...this.store.getState().antivirus,
                scanning: true,
              });
            }
          },
        });

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'task', '*', 'update').subscribe({
          next: async (notifyEvent: NotifierEvent) => {
            console.log('UPDATE', notifyEvent);
            if (notifyEvent.additional_data.status === 'running' && notifyEvent.additional_data.name === TaskEventName.scan) {
              this.updateState({
                ...this.store.getState().antivirus,
                scanning: true,
              });
            }
          },
        }),
      );

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'task', '*', 'delete').subscribe({
          next: async (notifyEvent: NotifierEvent) => {
            console.log('DELETE', notifyEvent);
            const taskName = getNestedObject(notifyEvent, ['additional_data', 'name']);
            if (taskName !== undefined) {
              switch (taskName) {
                case TaskEventName.scan:
                  await this.getScanResult(notifyEvent, this.userNotification, this.t, this.siteId);
                  break;
                case TaskEventName.filesDelete:
                  await this.deleteFilesPostProcess(notifyEvent, this.userNotification, this.t);
                  break;
                case TaskEventName.filesCure:
                  await this.cureFilesPostProcess(notifyEvent, this.userNotification, this.t);
                  this.getScanResult(notifyEvent, this.userNotification, this.t, this.siteId);
                  break;
              }
            }
          },
        }),
      );
    }

    configureNotifier(this.notifierService, { plugin: [this.pluginId] });
  }

  /**
   * LIFECYCLE
   * Prepare component, load data from server
   */
  async componentDidLoad() {
    await Promise.all([
      this.checkFeatures(),
      this.getSettingPresets(this.siteId),
      this.getLastScan(this.siteId),
      this.getInfectedFiles(this.siteId),
      /** @todo may be get price list for only free version */
      this.getPriceList(),
      this.loadTranslate(
        // prettier-ignore
        getNestedObject(this.translateService, ['currentLang'])
        || getNestedObject(this.translateService, ['defaultLang'])
        || defaultLang,
      ),
    ]);

    if (this.translateService !== undefined) {
      this.translateService.onLangChange.subscribe(d => {
        if (d.lang in languages) {
          this.loadTranslate(d.lang);
        }
      });
    }

    // get url params
    const [defaultLocation, queryParam] = location.toString().split('?');

    if (Boolean(queryParam)) {
      const searchParams = new URLSearchParams(queryParam);

      // search page in query params
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

    this.isPreloader.card = false;
  }

  /**
   * LIFECYCLE
   * Unsubscribe when component remove
   */
  componentDidUnload() {
    this.sub.unsubscribe();
  }

  /**
   * Handle to buy pro version
   */
  async buyProVersion() {
    purchase(this.priceList.id, this.priceList.price[0].id, this.pluginId, this.notifierService);

    this.updateState({
      ...this.store.getState().antivirus,
      purchasing: true,
    });
  }

  renderBuyModal = () => (
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
        <antivirus-card-preloader type="overlay" inline loading={this.purchasing}>
          <antivirus-card-button btn-theme="accent" onClick={this.buyProVersion.bind(this)}>
            {this.t.msg(['SUBSCRIBE_FOR'], {
              cost: this.priceList.price[0].cost,
              currency: getCurrencySymbol(this.priceList.price[0].currency),
            })}
          </antivirus-card-button>
        </antivirus-card-preloader>
        {!this.purchasing && (
          <a class="link link_indent-left" onClick={() => this.buyModal.toggle(false)}>
            {this.t.msg(['NOT_NOW'])}
          </a>
        )}
      </div>
    </antivirus-card-modal>
  );

  renderBuyFailedModal = () => (
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
  );

  render() {
    if (this.isPreloader.card) {
      return <antivirus-card-spinner-round width="60px" position="relative" height="250px"></antivirus-card-spinner-round>;
    }
    return (
      <Host>
        <h2 class="title">{this.t.msg(['TITLE'])}</h2>
        <antivirus-card-navigation items={this.items} />
        {this.items.find(item => item.active).component()}
        {this.renderBuyModal()}
        {this.renderBuyFailedModal()}
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
