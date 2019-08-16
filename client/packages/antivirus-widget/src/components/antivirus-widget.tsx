import { Component, Prop, h, State } from '@stencil/core';
import { loadTranslate, getNestedObject } from '../utils/utils';
import { languages, defaultLang, languageTypes } from '../constants';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Translate, Notifier, UserNotification, NotifierEvent } from '../store/types';
import { Store, WidgetState } from '../store/widget.store';
import { StaticState } from './StaticState';
import { ActiveState } from './ActiveState';

/**
 * The imunifyav-widget web component
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

  /** infected files count */
  @Prop() infectedCount: number;

  /** Translate service */
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };

  /** url to antivirus main page */
  @Prop() url: string;

  /** global notifier object */
  @Prop() notifier: Notifier;

  /** Global user notification service */
  @Prop() userNotification: UserNotification;

  /** Site id */
  @Prop() siteId: number;

  /** Widget state */
  @State() state: WidgetState;

  /** translate object */
  @State() t: Translate;

  /** Preloader state */
  @State() isPreloader = {
    button: false,
  };

  constructor() {
    this.store = new Store(this.siteId, this.userNotification);
    this.sub.add(
      this.store.state$.subscribe({
        next: newState => (this.state = newState),
      }),
    );
  }

  async componentWillLoad() {
    // prettier-ignore
    this.t = await loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    this.store.t = this.t;

    if (this.notifier !== undefined) {
      this.sub.add(
        this.notifier
          .taskList$()
          .pipe(take(1))
          .subscribe({
            next: async (events: NotifierEvent[]) => {
              console.log('TASK LIST', events);

              const runningTask = events.find(event => ['running'].includes(getNestedObject(event, ['additional_data', 'status'])));
              if (runningTask !== undefined) {
                await this.store.updateStateByNotify(runningTask);
              }
            },
          }),
      );

      this.sub.add(
        this.notifier.update$().subscribe({
          next: async (notify: { event: NotifierEvent }) => {
            console.log('UPDATE', notify.event);
            if (getNestedObject(notify.event, ['additional_data', 'status']) === 'running') {
              await this.store.updateStateByNotify(notify.event);
            }
          },
        }),
      );

      this.sub.add(
        this.notifier.delete$().subscribe({
          next: async (notify: { event: NotifierEvent }) => {
            console.log('DELETE', notify.event);
            if (getNestedObject(notify.event, ['additional_data', 'status']) !== undefined) {
              await this.store.updateStateByNotify(notify.event);
            }
          },
        }),
      );
    }

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
    this.state.isProVersion
      ? (location.href = `${this.url}?page=infectedFiles`)
      : (location.href = `${this.url}?page=infectedFiles&openModal=buyModal`);
    this.isPreloader = { ...this.isPreloader, button: false };
  }

  /** @todo add handle for stop scan files, when this function realise in backend */
  handleClickStopScan() {}

  /** @todo add handle for stop cure files, when this function realise in backend */
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
