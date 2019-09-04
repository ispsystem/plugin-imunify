import { Component, Prop, h, State, Watch } from '@stencil/core';
import { loadTranslate, getNestedObject } from '../utils/utils';
import { languages, defaultLang, languageTypes } from '../constants';
import { Observable, Subscription, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Translate, UserNotification } from '../store/types';
import { Store, WidgetState } from '../store/widget.store';
import { StaticState } from './StaticState';
import { ActiveState } from './ActiveState';
import { ISPNotifier, ISPNotifierEvent, ISPNotifierNotifyType } from '@ispsystem/notice-tools';

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

  /** Site id */
  @Prop() siteId: number;

  /** Plugin id */
  @Prop() pluginId: number;

  /** Widget state */
  @State() state: WidgetState;

  /** translate object */
  @State() t: Translate;

  /** Preloader state */
  @State() isPreloader = {
    button: false,
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
    this.store = new Store(this.siteId, this.pluginId, this.userNotification);
    this.sub.add(
      this.store.state$.subscribe({
        next: newState => (this.state = newState),
      }),
    );
  }

  /**
   * LIFECYCLE
   *
   * Initialize data
   */
  async componentWillLoad() {
    // prettier-ignore
    this.t = await loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    this.store.t = this.t;

    this.configureNotifier(this.notifierService);

    await Promise.all([this.store.getPresets(), this.store.getFeature(), this.store.getInfectedFiles(), this.store.getLastScan()]);

    if (this.translateService) {
      this.translateService.onLangChange.subscribe(async d => {
        if (d.lang in languages) {
          this.t = await loadTranslate(d.lang);
        }
      });
    }
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

  render() {
    return (
      <section class="overview-widget-list__item widget_adaptive">
        <div>
          <a class="overview-widget-list__item-link" href={this.url}>
            {this.t.msg(['WIDGET', 'ANTIVIRUS'])}
          </a>
        </div>
        {(this.state.scanning && (
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
          )}
      </section>
    );
  }
}
