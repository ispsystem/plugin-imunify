import '@stencil/redux';

import { Component, h, State, Listen, Prop, Watch, Host, Method } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { ProIcon } from './icons/pro';
import { TranslateActions } from '../models/translate.actions';
import { ITranslate } from '../models/translate.reducers';
import { Observable, Subscription, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { defaultLang, languageTypes, languages } from '../constants';
import { getNestedObject, getCurrencySymbol, configureNotifier, NotifierEntityIds } from '../utils/tools';
import { AntivirusActions } from '../models/antivirus/actions';
import { UserNotification } from '../redux/user-notification.interface';
import { TaskEventName, NavigationItem, AntivirusCardPages, PaymentStatus } from '../models/antivirus/model';
import { AntivirusState } from '../models/antivirus/state';
import { purchase, getPaymentOrders } from '../utils/controllers';
import { NotifierActions } from '../models/notifier.actions';
import { ISPNotifier, ISPNotifierEvent } from '@ispsystem/notice-tools';

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
  /** Modal for new scan */
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
  @Prop() notifierService: ISPNotifier;
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
  /** History item count of scanning */
  @State() historyItemCount: AntivirusState['historyItemCount'];
  /** Price list for buy pro version */
  @State() priceList: AntivirusState['priceList'];
  /** flag is true if this antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;
  /** nested components */
  @State() items: NavigationItem[];
  /** first loading flag */
  @State() isPreloader = { card: true };

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
   * Update notifier when change notifierService prop
   */
  @Watch('notifierService')
  updateNotifierState(): void {
    if (this.notifierService !== undefined) {
      this.notifierService
        .getTaskList('plugin', this.pluginId, 'task', '*')
        .pipe(take(1))
        .subscribe({
          next: async (notifyEvents: ISPNotifierEvent[]) => {
            console.log('TASK LIST', notifyEvents);
            const runningTask = notifyEvents.find(event => getNestedObject(event, ['additional_data', 'status']) === 'running');
            if (runningTask !== undefined && runningTask.additional_data.name === TaskEventName.scan) {
              this.updateState({
                ...this.store.getState().antivirus,
                scanning: true,
              });
            }
          },
        });

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'update').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
            console.log('UPDATE activate', notifyEvent);
            const taskName = getNestedObject(notifyEvent, ['additional_data', 'name']);
            if (taskName === TaskEventName.pluginActivate && notifyEvent.additional_data.status === 'complete') {
              this.updateState({
                ...this.store.getState().antivirus,
                purchasing: false,
                isProVersion: true,
              });
            }
          },
        }),
      );

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'task', '*', 'update').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
            console.log('UPDATE scan', notifyEvent);
            const taskName = getNestedObject(notifyEvent, ['additional_data', 'name']);
            if (taskName === TaskEventName.scan && notifyEvent.additional_data.status === 'running') {
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
          next: async (notifyEvent: ISPNotifierEvent) => {
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
                  break;
              }
            }
          },
        }),
      );

      const notifierParams: NotifierEntityIds = { plugin: [this.pluginId] };
      if (!this.isProVersion) {
        getPaymentOrders().subscribe({
          next: data => {
            const orders = data.list
              .map(order => {
                if (order.service_type === 'plugin' && order.type === 'purchase' && order.status === 'Payment') {
                  return order.id;
                }
              })
              .filter(order => order);

            if (orders.length > 0) {
              notifierParams.market_order = orders;
              this.updateState({
                ...this.store.getState().antivirus,
                purchasing: true,
              });
              this.sub.add(
                this.notifierService.getEvents('market_order', '*', 'task', '*', 'delete').subscribe({
                  next: async (notifyEvent: ISPNotifierEvent) => {
                    console.log('MARKET_ORDER TASK DELETE', notifyEvent);
                    this.checkFeatures();
                  },
                }),
              );
            }
            configureNotifier(this.notifierService, notifierParams);
          },
          error: error => {
            console.warn(error);
            configureNotifier(this.notifierService, notifierParams);
          },
        });
      } else {
        configureNotifier(this.notifierService, notifierParams);
      }

      this.updateNotifier(this.notifierService);
    }
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
   * Method for change active item
   *
   * @param name - name of item
   */
  @Method()
  async changeActiveItem(name: AntivirusCardPages): Promise<void> {
    this.items = this.items.map(item => {
      item.active = item.name === name;
      return item;
    });
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
  /** Method for update notifier */
  updateNotifier: typeof NotifierActions.updateNotifier;

  /**
   * LIFECYCLE
   * Init global store and subscribe to notifications
   */
  async componentWillLoad(): Promise<void> {
    configureNotifier(this.notifierService, { plugin: [this.pluginId] });

    if (this.userNotification === undefined) {
      console.warn('User notification service was not provided');
      this.userNotification = {
        push: banner => {
          console.warn('USER NOTIFY!!', banner);

          return of(null);
        },
      };
    }
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
      updateNotifier: NotifierActions.updateNotifier,
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

    this.updateNotifierState();
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

    this.isPreloader = { ...this.isPreloader, card: false };
  }

  /**
   * LIFECYCLE
   * Search params in location url
   */
  async componentDidUpdate() {
    if (!this.isPreloader.card) {
      // get url params
      const [defaultLocation, queryParam] = location.toString().split('?');

      if (Boolean(queryParam)) {
        const searchParams = new URLSearchParams(queryParam);

        // search page in query params
        if (searchParams.has('page')) {
          const foundItem = this.items.find(i => i.name === searchParams.get('page'));

          if (foundItem !== undefined) {
            await this.changeActiveItem(foundItem.name);
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
          switch (paymentStatus) {
            case 'failed':
              this.failedPaymentModal.toggle(true);
              break;
            /** @todo: process  paymentStatus success and pending*/
            default:
              break;
          }
          searchParams.delete('payment');
        }
        history.replaceState(
          {},
          document.title,
          `${defaultLocation}${searchParams.toString() !== '' ? '?' + searchParams.toString() : ''}`,
        );
      }
    }
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
    this.updateState({
      ...this.store.getState().antivirus,
      purchasing: true,
    });
    const orderNotifier = await purchase(this.priceList.id, this.priceList.price[0].id, this.pluginId, this.notifierService);
    orderNotifier.subscribe({
      next: paymentLink => {
        location.replace(paymentLink);
      },
      error: error => {
        console.warn(error);
        this.updateState({
          ...this.store.getState().antivirus,
          purchasing: false,
        });
      },
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
          {this.priceList && (
            <antivirus-card-button btn-theme="accent" onClick={this.buyProVersion.bind(this)}>
              {this.t.msg(['SUBSCRIBE_FOR'], {
                cost: this.priceList.price[0].cost,
                currency: getCurrencySymbol(this.priceList.price[0].currency),
              })}
            </antivirus-card-button>
          )}
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
        <antivirus-card-button
          btn-theme="accent"
          onClick={() => {
            this.buyProVersion();
            this.failedPaymentModal.toggle(false);
          }}
        >
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
    } else {
      return (
        <Host>
          <h2 class="title">{this.t.msg(['TITLE', this.isProVersion ? 'PRO' : 'FREE'])}</h2>
          <antivirus-card-navigation items={this.items} />
          {this.items.find(item => item.active).component()}
          {this.renderBuyModal()}
          {this.renderBuyFailedModal()}
        </Host>
      );
    }
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
