import '@stencil/redux';

import { Component, h, Host, State, JSX, Listen, Prop } from '@stencil/core';
import { FreeIcon } from './icons/free';
import { Store } from '@stencil/redux';
import { configureStore } from '../redux/store';
import { RootState } from '../redux/reducers';
import { ActionTypes } from '../redux/actions';
import { AntivirusState } from '../models/antivirus.reducers';

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
  /** previods for PRO version */
  public proPeriods = [
    {
      msg: 'Месячная',
      monthCost: '4.9 €/мес',
      fullCost: '4.9 €'
    },
    {
      msg: 'Годовая',
      monthCost: '4.08 €/мес при оплате за год',
      fullCost: '49 €'
    }
  ];

  /** selected period */
  @State()
  selectedPeriod = 0;

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

  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  componentWillLoad() {
    this.store.setStore(
      configureStore({
        antivirus: {
          lastScan: 'сегодня в 06:00',
          hasScheduledActions: false,
          infectedFiles: []
          // scanning: true,
        } as AntivirusState
      })
    );
  }

  /**
   * Litening event to open buy modal
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
        <h2 class="title">Антивирус imunifyAV</h2>
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
          <LableForByModal text="Лечение заражённых файлов" />
          <LableForByModal text="Сканирование по расписанию" />
          <LableForByModal text="Оповещения об угрозах на почту" />
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
    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>
      <FreeIcon />
    </span>
    <span>{props.text}</span>
  </div>
);
