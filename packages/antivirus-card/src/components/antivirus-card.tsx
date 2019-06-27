import { Component, h, Host, State, JSX } from '@stencil/core';
import { FreeIcon } from './icons/free';

@Component({
  tag: 'antivirus-card',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class AntivirusCard {
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

  public buyModal: HTMLAntivirusCardModalElement;

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
  @State()
  public selectedPeriod = 0;

  render() {
    return (
      <Host>
        <h2 class="title">Антивирус imunifyAV</h2>
        <antivirus-card-navigation items={this.items} onClickItem={this.handleClickItem.bind(this)} />
        {this.items.find(item => item.active).component()}
        <antivirus-card-modal modal-width="370px" visible ref={el => (this.buyModal = el)}>
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

  handleClickItem(e: MouseEvent) {
    const beforeIndex = this.items.findIndex(item => item.active);
    this.items[beforeIndex].active = false;
    this.items[e.detail].active = true;

    this.items = [...this.items];
  }
}

const LableForByModal = props => (
  <div style={{ margin: '10px 0' }}>
    <span style={{ marginRight: '5px', verticalAlign: 'middle' }}>
      <FreeIcon />
    </span>
    <span>{props.text}</span>
  </div>
);
