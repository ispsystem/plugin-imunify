import '@stencil/redux';

import { Component, h, State, Listen, Prop, Watch, Host, Method } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { ProIcon } from './icons/pro';
import { TranslateActions } from '../models/translate.actions';
import { Translate } from '../models/translate.reducers';
import { Observable, Subscription, of } from 'rxjs';
import { take, first, filter } from 'rxjs/operators';
import { defaultLang, languageTypes, languages, isDevMode, SITE_ID } from '../constants';
import { getNestedObject, getCurrencySymbol, configureNotifier, NotifierEntityIds } from '../utils/tools';
import { AntivirusActions } from '../models/antivirus/actions';
import { UserNotification } from '../redux/user-notification.interface';
import { TaskEventName, NavigationItem, AntivirusCardPages, PaymentStatus } from '../models/antivirus/model';
import { AntivirusState } from '../models/antivirus/state';
import { purchase, getPaymentOrders, getOrderInfo, OrderStatus, markOrderAsDelete, PaymentOrders } from '../utils/controllers';
import { NotifierActions } from '../models/notifier.actions';
import { ISPNotifier, ISPNotifierEvent } from '@ispsystem/notice-tools';
import { ThemePalette } from './button/button.interface';
import { SiteActions } from '../models/site.actions';

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
  /** observable of siteId from vepp */
  @Prop() siteId$: Observable<number>;
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
  /** flag is purchase error exist */
  @State() havePurchaseError: RootState['antivirus']['havePurchaseError'];
  /** History item count of scanning */
  @State() historyItemCount: AntivirusState['historyItemCount'];
  /** Price list for buy pro version */
  @State() priceList: AntivirusState['priceList'];
  /** flag is true if this antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: Translate;
  /** nested components */
  @State() items: NavigationItem[];
  /** first loading flag */
  @State() isPreloader = { card: true };
  /** vepp site id */
  @State() siteId: RootState['siteId'];

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
            const runningTask = notifyEvents.find(event => getNestedObject(event, ['additional_data', 'status']) === 'running');
            if (
              runningTask !== undefined &&
              [TaskEventName.scanPartial, TaskEventName.scanFull].includes(runningTask.additional_data.name)
            ) {
              this.updateState({
                ...this.store.getState().antivirus,
                scanning: runningTask.additional_data.name === TaskEventName.scanPartial ? 'PARTIAL' : 'FULL',
              });
            }
          },
        });

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'update').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
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
            const taskName = getNestedObject(notifyEvent, ['additional_data', 'name']);
            if (
              [TaskEventName.scanPartial, TaskEventName.scanFull].includes(taskName) &&
              notifyEvent.additional_data.status === 'running'
            ) {
              this.updateState({
                ...this.store.getState().antivirus,
                scanning: taskName === TaskEventName.scanPartial ? 'PARTIAL' : 'FULL',
              });
            }
            if (taskName === TaskEventName.filesCure && notifyEvent.additional_data.status === 'running') {
              this.updateState({
                ...this.store.getState().antivirus,
                healing: true,
              });
            }
          },
        }),
      );

      this.sub.add(
        this.notifierService.getEvents('plugin', this.pluginId, 'task', '*', 'delete').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
            const taskName = getNestedObject(notifyEvent, ['additional_data', 'name']);
            if (taskName !== undefined) {
              switch (taskName) {
                case TaskEventName.scanPartial:
                case TaskEventName.scanFull:
                  await this.getScanResult(notifyEvent, this.userNotification, this.t, this.siteId);
                  break;
                case TaskEventName.filesDelete:
                  await this.deleteFilesPostProcess(notifyEvent, this.userNotification, this.t);
                  break;
                case TaskEventName.filesCure:
                  await this.cureFilesPostProcess(notifyEvent, this.userNotification, this.t);
                  this.updateState({
                    ...this.store.getState().antivirus,
                    healing: false,
                  });
                  break;
              }
            }
          },
        }),
      );

      const notifierParams: NotifierEntityIds = { plugin: [this.pluginId] };
      if (!this.isProVersion) {
        getPaymentOrders().subscribe({
          next: (data: PaymentOrders) => {
            const orderIdList = data.list
              .map(order => {
                if (order.service_type === 'plugin' && order.type === 'purchase' && order.status === OrderStatus.PAYMENT) {
                  return order.id;
                }
              })
              .filter(Boolean);

            if (orderIdList.length > 0) {
              notifierParams.market_order = orderIdList;
              this.updateState({
                ...this.store.getState().antivirus,
                purchasing: true,
              });
              this.sub.add(
                this.notifierService.getEvents('market_order', '*', 'task', '*', 'delete').subscribe({
                  next: async () => {
                    this.checkFeatures();
                  },
                }),
              );
            } else {
              /** check last order on Delete or Fail status */
              if (data.list[0] !== undefined && [OrderStatus.FAIL, OrderStatus.DELETED].includes(data.list[0].status)) {
                this.updateState({
                  ...this.store.getState().antivirus,
                  havePurchaseError: true,
                });
              }
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
  /** Method for update site id in state */
  updateSiteId: typeof SiteActions.updateSiteId;

  /**
   * LIFECYCLE
   * Init global store and subscribe to notifications
   */
  async componentWillLoad(): Promise<void> {
    configureNotifier(this.notifierService, { plugin: [this.pluginId] });

    if (isDevMode) {
      this.siteId$ = of(SITE_ID);
    }
    this.siteId = await this.siteId$.pipe(first()).toPromise();

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
      siteId: state.siteId,
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
      updateSiteId: SiteActions.updateSiteId,
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
    ]);

    this.sub.add(this.siteId$.pipe(filter(id => this.siteId !== id)).subscribe(await this.onChangeSiteId.bind(this)));

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
          const orderId = searchParams.get('order_id');
          switch (paymentStatus) {
            /** @todo: process for pending status */
            case 'pending':
            case 'failed':
              this.onPaymentFailure(Number(orderId));
              this.failedPaymentModal.toggle(true);
              break;
            /** @todo: process  paymentStatus success and pending*/
            default:
              break;
          }
          searchParams.delete('order_id');
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
    if (!this.purchasing) {
      this.updateState({
        ...this.store.getState().antivirus,
        purchasing: true,
      });
      const orderNotifier = await purchase(this.priceList.id, this.priceList.price[0].id, this.notifierService);
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
  }

  /**
   * Mark order as delete if payment failure
   * @param orderId - order id
   */
  async onPaymentFailure(orderId: number) {
    if (orderId > 0) {
      const orderInfo = await getOrderInfo(orderId);
      if ([OrderStatus.FAIL, OrderStatus.PAYMENT].includes(orderInfo.status)) {
        markOrderAsDelete(orderId).then(() => {
          this.updateState({
            ...this.store.getState().antivirus,
            purchasing: false,
            havePurchaseError: true,
          });
        });
      }
    }
  }

  /**
   * Method for update state if site id changed
   * @param siteId - new site id
   */
  async onChangeSiteId(siteId: number) {
    this.isPreloader = { ...this.isPreloader, card: true };
    this.updateSiteId(siteId);
    await Promise.all([this.getSettingPresets(siteId), this.getLastScan(siteId), this.getInfectedFiles(siteId)]);
    this.isPreloader = { ...this.isPreloader, card: false };
  }

  /**
   * Return a flag for display addition status in title
   */
  displayStatus(): boolean {
    return !this.isProVersion && (this.purchasing || this.havePurchaseError);
  }

  /**
   * Return message for title status
   */
  getTitleStatusMsg(): string {
    return this.purchasing ? this.t.msg(['TITLE', 'STATUS', 'PURCHASING']) : this.t.msg(['TITLE', 'STATUS', 'ERROR']);
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

  renderFirstScan = () => (
    <div>
      <h2 class="title">{this.t.msg(['TITLE', this.isProVersion ? 'PRO' : 'FREE'])}</h2>

      <div style={{ display: 'flex', 'flex-direction': 'column' }}>
        <span>{this.t.msg(['PREVIEW', 'FIRST_SCAN', 'TEXT_1'])}</span>
        <span>{this.t.msg(['PREVIEW', 'FIRST_SCAN', 'TEXT_2'])}</span>
        <div style={{ display: 'inline-block', 'margin-top': '25px' }}>
          <antivirus-card-button theme={ThemePalette.accent} onClick={() => this.scanVirus(this.scanPreset.full.id, 'FULL', this.siteId)}>
            {this.t.msg(['PREVIEW', 'FIRST_SCAN', 'BUTTON'])}
          </antivirus-card-button>
        </div>
      </div>
    </div>
  );

  render() {
    if (this.isPreloader.card) {
      return (
        <Host>
          <h2 class="title">{this.t.msg(['TITLE', this.isProVersion ? 'PRO' : 'FREE'])}</h2>
          <antivirus-card-spinner-round width="60px" position="relative" height="250px"></antivirus-card-spinner-round>
        </Host>
      );
    } else if (this.historyItemCount === 0 && !this.scanning) {
      return this.renderFirstScan();
    } else {
      return (
        <Host>
          <div class="main-title">
            <h2 class="title">{this.t.msg(['TITLE', this.isProVersion ? 'PRO' : 'FREE'])}</h2>
            {this.displayStatus() && (
              <div style={{ display: 'flex', 'align-items': 'center', 'padding-left': '8px' }}>
                <antivirus-card-spinner-round
                  hidden={!this.purchasing}
                  width="20px"
                  height="20px"
                  style={{ width: '20px', height: '20px' }}
                ></antivirus-card-spinner-round>
                <span class={this.purchasing ? 'status_payment' : 'status_error'} style={{ 'margin-left': '8px' }}>
                  {this.getTitleStatusMsg()}
                </span>
              </div>
            )}
          </div>
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
