import { Component, Prop, h, State } from '@stencil/core';
import { loadTranslate, getNestedObject } from '../utils/utils';
import { languages, defaultLang, languageTypes } from '../constants';
import { Observable } from 'rxjs';
import { Translate, Notifier, UserNotification, NotifierEvent, TaskEventName } from '../store/types';
import { Store, WidgetState } from '../store/widget.store';
import { distinctUntilChanged, map, tap, take } from 'rxjs/operators';
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
  /** Global store */
  store: Store;
  // state: WidgetState;
  @Prop() infectedCount: number;
  /** Translate service */
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };
  /** url ?? */
  @Prop() url: string;
  /** global notifier object */
  @Prop() notifier: Notifier;
  /** Global user notification service */
  @Prop() userNotification: UserNotification;
  /** Site id */
  @Prop() siteId: number;
  @State() state: WidgetState;
  /** translate object */
  @State() t: Translate;

  @State() isPreloader = {
    button: false,
  };

  constructor() {
    this.store = new Store(this.siteId);
    this.store.state$.subscribe({
      next: newState => (this.state = newState),
    });
  }

  async componentWillLoad() {
    // prettier-ignore
    this.t = await loadTranslate(
      getNestedObject(this.translateService, ['currentLang'])
      || getNestedObject(this.translateService, ['defaultLang'])
      || defaultLang
    );

    console.log('NOTIFIER', this.notifier);

    if (this.notifier !== undefined) {
      // setTimeout(() => {

      // }, 12000);
      this.notifier
        .taskList$()
        .pipe(
          tap(_ => console.log(_)),
          take(1),
        )
        .subscribe((event: NotifierEvent[]) => {
          console.log('EVENT', event);

          if (event && Array.isArray(event) && event.length > 0) {
            const runningPluginTasks = event.filter(e => ['created', 'running', 'deferred'].includes(e.additional_data.status));

            console.log('LISTS', runningPluginTasks);
            this.store.addTask(
              runningPluginTasks.map(task => ({ name: task.additional_data.name, id: task.id, status: task.additional_data.status })),
            );
          }
        });

      // subscribe to tasks
      this.notifier
        .ids(
          this.store.taskList$.pipe(
            map(list =>
              list.map(e => {
                console.log('its my list', e);
                return e.id;
              }),
            ),
            distinctUntilChanged(),
          ),
        )
        .delete$()
        .subscribe((notify: { event: NotifierEvent }) => {
          console.log('NOTIFY!!', event);

          switch (notify.event.additional_data.name) {
            case TaskEventName.scan: {
              /** @todo await? */
              this.store.getScanResult(notify);
              break;
            }
            case TaskEventName.cure: {
              /** @TODO add handle for cure files success */
              break;
            }
          }
        });
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

  async handleClickRetryScan() {
    this.isPreloader = { ...this.isPreloader, button: true };
    await this.store.scan();
    this.isPreloader = { ...this.isPreloader, button: false };
  }

  handleClickCure(event: Event) {
    console.log('CURE', event);
    /** @todo add event by cure */
  }

  handleClickStopScan(event: Event) {
    // ???
    console.log('CLOSE SCAN', event);
  }

  handleClickStopCure(event: Event) {
    // ???
    console.log('CLOSE CURE', event);
  }

  render() {
    return (
      <section class="overview-widget-list__item widget_adaptive">
        <div>
          <a class="overview-widget-list__item-link" href="#/site/1/settings/files">
            {this.t.msg(['WIDGET', 'ANTIVIRUS'])}
          </a>
        </div>
        {(this.state.scanning && (
          <ActiveState desc={this.t.msg(['WIDGET', 'ACTION', 'SCANNING'])} handleClickCancel={this.handleClickStopScan} />
        )) ||
          (this.state.scanning && (
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
