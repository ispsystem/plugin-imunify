import '@stencil/redux';

import { Component, h, Host, State, JSX, Listen, Prop } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState, INotifier } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { AntivirusActions } from '../models/antivirus.actions';
import { ProIcon } from './icons/pro';
import { AntivirusState } from '../models/antivirus.reducers';
import { TranslateActions } from '../models/translate.actions';
import { ITranslate } from '../models/translate.reducers';
import { Observable } from 'rxjs';
import { defaultLang, languageTypes, languages } from '../constants';

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
  }[] = [
    {
      label: 'Обзор',
      active: true,
      component: () => <antivirus-card-preview />
    },
    {
      label: 'Заражённые файлы',
      active: false,
      component: () => <antivirus-card-infected-files />
    },
    {
      label: 'История сканирований',
      active: false,
      component: () => <antivirus-card-history />
    }
  ];

  @Prop() notifier: INotifier;
  @Prop() translateService: { currentLang: string; onLangChange: Observable<{ lang: languageTypes }> };

  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  checkFeatures: typeof AntivirusActions.feature;
  updateState: typeof AntivirusActions.updateState;
  loadTranslate: typeof TranslateActions.load;

  async componentWillLoad() {
    this.store.setStore(
      configureStore({
        notifier: this.notifier,
        antivirus: {
          history: [
            {
              date: new Date(Date.now() - 864e5).getTime(),
              checkType: 'полная',
              infectedFilesCount: 0
            }
          ]
        } as AntivirusState
      })
    );

    this.store.mapStateToProps(this, state => ({ translate: state.translate }));

    this.store.mapDispatchToProps(this, {
      checkFeatures: AntivirusActions.feature,
      updateState: AntivirusActions.updateState,
      loadTranslate: TranslateActions.load
    });

    const getNestedObject = (nestedObj, pathArr) => {
      return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
    };

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
      this.notifier.taskList$().subscribe(d => console.log('taskList ', d));

      this.notifier.create$().subscribe(d => {
        console.log(d);

        if (this.store.getState().antivirus.history.length === 1) {
          this.updateState({
            ...this.store.getState().antivirus,
            error: null,
            history: [
              ...this.store.getState().antivirus.history,
              {
                date: Date.now(),
                checkType: 'полная',
                infectedFilesCount: 3
              }
            ],
            infectedFiles: [
              {
                name: 'beregovoi_orcestr.bat',
                status: 'заражён',
                type: 'Troyan.enspect',
                createdDate: new Date(Date.now() - 864e5).getTime(),
                path: 'sanin/save',
                datedetectionDate: Date.now()
              },
              {
                name: 'yua_ne_virus.r',
                status: 'заражён',
                type: 'Atos_7vers',
                createdDate: new Date(Date.now() - 864e5).getTime(),
                path: 'sanin/doc/look_today_or_die...',
                datedetectionDate: Date.now()
              },
              {
                name: 'posilka_from_ust-kut.malazip',
                status: 'заражён',
                type: 'Plachuschii_Virus',
                createdDate: new Date(Date.now() - 864e5).getTime(),
                path: 'sanin/doc/verryy',
                datedetectionDate: Date.now()
              }
            ]
          });
        } else {
          this.updateState({
            ...this.store.getState().antivirus,
            history: [
              ...this.store.getState().antivirus.history,
              {
                date: Date.now(),
                checkType: 'полная',
                infectedFilesCount: 3
              }
            ],
            inBlackLists: true
          });
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
          <span class="title">Подписка Imunify Pro</span>
          <antivirus-card-switcher style={{ display: 'block', marginTop: '20px' }}>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 0)} active>
              {this.proPeriods[0].msg}
            </antivirus-card-switcher-option>
            <antivirus-card-switcher-option onClick={() => (this.selectedPeriod = 1)} last>
              {this.proPeriods[1].msg}
            </antivirus-card-switcher-option>
          </antivirus-card-switcher>
          <p style={{ marginBottom: '30px' }}>{this.proPeriods[this.selectedPeriod].monthCost}</p>
          <LableForByModal text="Ежедневное сканирование сайта" />
          <LableForByModal text="Обновление вирусных баз" />
          <LableForByModal text="Поиск сайта в черных списках" />
          <LableForByModal pro text="Лечение заражённых файлов" />
          <LableForByModal pro text="Сканирование по расписанию" />
          <LableForByModal pro text="Оповещения об угрозах на почту" />
          <div class="button-container">
            <antivirus-card-button btn-theme="accent" onClick={() => (this.buyModal.visible = false)}>
              Оформить подписку за {this.proPeriods[this.selectedPeriod].fullCost}
            </antivirus-card-button>
            <a class="link link_indent-left" onClick={() => (this.buyModal.visible = false)}>
              Нет, не сейчас
            </a>
          </div>
        </antivirus-card-modal>
      </Host>
    );
  }
}

/**
 *
 * LableForByModal Functional Components
 * @param props - properties
 */
const LableForByModal = props => (
  <div style={{ margin: '10px 0' }}>
    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>{props.pro ? <ProIcon /> : <FreeIcon />}</span>
    <span>{props.text}</span>
  </div>
);
