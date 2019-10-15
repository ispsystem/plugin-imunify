import { Component, Prop, h, State, Watch } from '@stencil/core';
import { loadTranslate, getNestedObject } from '../utils/utils';
import { languages, defaultLang, languageTypes, isDevMode, SITE_ID } from '../constants';
import { Observable, Subscription, of } from 'rxjs';
import { take, first, filter } from 'rxjs/operators';
import { Translate, UserNotification } from '../store/types';
import { Store, WidgetState } from '../store/widget.store';
import { StaticState } from './StaticState';
import { ActiveState } from './ActiveState';
import { ISPNotifier, ISPNotifierEvent, ISPNotifierNotifyType } from '@ispsystem/notice-tools';
import { AntivirusSpinnerRound } from './icons/antivirus-spinner-round';

/**
 * The imunifyAV-widget web component
 */
@Component({
  tag: 'antivirus-widget',
  styleUrl: 'style.scss',
  shadow: true,
})
export class AntivirusWidget {
  /** RXJS subscription */
  sub = new Subscription();
  /** Global store */
  store: Store;

  /** Translate service */
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  /** url to antivirus main page */
  @Prop() url: string;
  /** global notifier object */
  @Prop() notifierService: ISPNotifier;
  /** Global user notification service */
  @Prop() userNotification: UserNotification;
  /** Observable of siteId from vepp */
  @Prop() siteId$: Observable<number>;
  /** Plugin id */
  @Prop() pluginId: number;

  /** Widget state */
  @State() state: WidgetState;
  /** translate object */
  @State() t: Translate;
  /** vepp site id */
  @State() siteId: number;
  /** Preloader state */
  @State() isPreloader = {
    button: false,
    widget: true,
  };

  /**
   * Update notification service params
   */
  @Watch('notifierService')
  updateNotificationParams() {
    this.configureNotifier(this.notifierService);
  }

  constructor() {
    if (this.userNotification === undefined) {
      console.warn('User notification service was not provided');
      this.userNotification = {
        push: () => {
          return of(null);
        },
      };
    }
  }

  /**
   * LIFECYCLE
   *
   * Initialize store and notifier
   */
  async componentWillLoad() {
    if (isDevMode) {
      this.siteId$ = of(SITE_ID);
    }
    this.siteId = await this.siteId$.pipe(first()).toPromise();

    this.store = new Store(this.siteId, this.pluginId, this.userNotification);
    this.sub.add(
      this.store.state$.subscribe({
        next: newState => (this.state = newState),
      }),
    );

    // prettier-ignore
    this.t = await loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    this.store.t = this.t;

    this.configureNotifier(this.notifierService);
  }

  /**
   * LIFECYCLE
   *
   * Initialize data
   */
  async componentDidLoad() {
    await Promise.all([this.store.getPresets(), this.store.getFeature(), this.store.getInfectedFiles(), this.store.getLastScan()]);

    if (this.translateService) {
      this.translateService.onLangChange.subscribe(async d => {
        if (d.lang in languages) {
          this.t = await loadTranslate(d.lang);
        }
      });
    }

    this.sub.add(this.siteId$.pipe(filter(id => this.siteId !== id)).subscribe(await this.onChangeSiteId.bind(this)));

    this.isPreloader = { ...this.isPreloader, widget: false };
  }

  /**
   * Lifecycle hook, unsubscribe when component remove
   */
  componentDidUnload() {
    this.sub.unsubscribe();
  }

  /**
   * Handle click retry scan site
   */
  async handleClickRetryScan() {
    this.isPreloader = { ...this.isPreloader, button: true };
    await this.store.scan();
    this.isPreloader = { ...this.isPreloader, button: false };
  }

  /**
   * Handle click start healing
   * @todo start heal all, when this feature realise in backend
   */
  async handleClickCure() {
    this.isPreloader = { ...this.isPreloader, button: true };
    if (!this.state.isProVersion) {
      location.href = `${this.url}?page=infectedFiles&openModal=buyModal`;
      return;
    }
    await this.store.cure();
    this.isPreloader = { ...this.isPreloader, button: false };
  }

  /**
   * Method for update state if site id changed
   * @param siteId - new site id
   */
  async onChangeSiteId(siteId: number) {
    this.isPreloader = { ...this.isPreloader, widget: true };
    this.siteId = siteId;
    this.store.setStateProperty({
      siteId,
    });
    await Promise.all([this.store.getPresets(), this.store.getInfectedFiles(), this.store.getLastScan()]);
    this.isPreloader = { ...this.isPreloader, widget: false };
  }

  /**
   * Method for configure notification service
   *
   * @param notifier - notification service
   */
  configureNotifier(notifier: ISPNotifier) {
    if (notifier !== undefined) {
      this.sub.add(
        notifier
          .getTaskList('plugin', this.pluginId, 'task', '*')
          .pipe(take(1))
          .subscribe({
            next: async (notifyEvents: ISPNotifierEvent[]) => {
              const runningTask = notifyEvents.find(event => ['running'].includes(getNestedObject(event, ['additional_data', 'status'])));
              if (runningTask !== undefined) {
                await this.store.updateStateByNotify(runningTask);
              }
            },
          }),
      );

      this.sub.add(
        notifier.getEvents('plugin', this.pluginId, 'task', '*', 'update').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
            if (getNestedObject(notifyEvent, ['additional_data', 'status']) === 'running') {
              await this.store.updateStateByNotify(notifyEvent);
            }
          },
        }),
      );

      this.sub.add(
        notifier.getEvents('plugin', this.pluginId, 'task', '*', 'delete').subscribe({
          next: async (notifyEvent: ISPNotifierEvent) => {
            if (getNestedObject(notifyEvent, ['additional_data', 'status']) !== undefined) {
              await this.store.updateStateByNotify(notifyEvent);
            }
          },
        }),
      );

      notifier.setParams({
        task_list: true,
        entities: [
          {
            entity: 'plugin',
            ids: [this.state.pluginId],
            type: [{ name: ISPNotifierNotifyType.CREATE }, { name: ISPNotifierNotifyType.UPDATE }, { name: ISPNotifierNotifyType.DELETE }],
            relations: [
              {
                entity: 'task',
                type: [
                  { name: ISPNotifierNotifyType.CREATE },
                  { name: ISPNotifierNotifyType.UPDATE },
                  { name: ISPNotifierNotifyType.DELETE },
                ],
              },
            ],
          },
        ],
      });
    }
  }

  /** @todo add handle for stop scan files, when this function realise in backend */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleClickStopScan() {}

  /** @todo add handle for stop cure files, when this function realise in backend */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleClickStopCure() {}

  /**
   * Render first loading state
   */
  renderPreloader = () => (
    <div class="antivirus-card-spinner-round">
      <AntivirusSpinnerRound color="#ed81b5" />
    </div>
  );

  /**
   * Render widget after loading
   */
  renderWidget = () => {
    return [
      <a class="overview-widget-list__item-link" href={this.url}>
        {this.t.msg(['WIDGET', 'ANTIVIRUS'])}
      </a>,
      (this.state.scanning && (
        <ActiveState desc={this.t.msg(['WIDGET', 'ACTION', 'SCANNING'])} handleClickCancel={this.handleClickStopScan} />
      )) ||
        (this.state.healing && (
          <ActiveState desc={this.t.msg(['WIDGET', 'ACTION', 'CURE'])} handleClickCancel={this.handleClickStopCure} />
        )) || (
          <StaticState
            t={this.t}
            handleClickRetryScan={this.handleClickRetryScan.bind(this)}
            handleClickCure={this.handleClickCure.bind(this)}
            lastCheck={this.state.lastCheck}
            infectedFilesCount={this.store.state.infectedFilesCount}
            disableClick={this.isPreloader.button}
          />
        ),
    ];
  };

  render() {
    return (
      <section class="overview-widget-list__item widget_adaptive">
        {this.isPreloader.widget ? this.renderPreloader() : this.renderWidget()}
      </section>
    );
  }
}
