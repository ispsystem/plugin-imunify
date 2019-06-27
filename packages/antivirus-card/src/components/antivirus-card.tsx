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

  render() {
    return (
      <Host>
        <h2 class="title">Антивирус imunifyAV</h2>
        <antivirus-card-navigation items={this.items} onClickItem={this.handleClickItem.bind(this)} />
        {this.items.find(item => item.active).component()}
        <antivirus-card-buy-modal title="Подписка Imunify Pro" visible>
          <antivirus-card-switcher>
            <antivirus-card-switcher-option active>Годовая</antivirus-card-switcher-option>
            <antivirus-card-switcher-option last>Месячная</antivirus-card-switcher-option>
          </antivirus-card-switcher>
          <p style={{ marginBottom: '30px' }}>4.08 €/мес при оплате за год</p>
          <LableForByModal text="Ежедневное сканирование сайта" />
          <LableForByModal text="Обновление вирусных баз" />
          <LableForByModal text="Поиск сайта в черных списках" />
          <LableForByModal text="Лечение заражённых файлов" />
          <LableForByModal text="Сканирование по расписанию" />
          <LableForByModal text="Оповещения об угрозах на почту" />
        </antivirus-card-buy-modal>
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
