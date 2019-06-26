import { Component, h, Host, State, JSX } from '@stencil/core';

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
