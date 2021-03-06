import { Component, Prop, Event, h, EventEmitter } from '@stencil/core';
import { NavigationItem } from '../../models/antivirus/model';

@Component({
  tag: 'antivirus-card-navigation',
  styleUrl: 'styles/$.scss',
  shadow: false,
})
export class ButtonComponent {
  @Prop() items: NavigationItem[] = [];

  @Event({
    bubbles: true,
    composed: true,
  })
  clickItem: EventEmitter;

  render() {
    return (
      <div style={{ '--ngispui-navigation-border-line-top': '-13px', 'margin-bottom': '30px' }} class="ngispui-navigation">
        {this.items.map(
          (val, index) =>
            !val.hidden && (
              <div
                onClick={this.handleClickItem.bind(this, index)}
                class={'ngispui-navigation-item ' + (val.active ? 'ngispui-navigation-item_active' : '')}
              >
                {val.label}
              </div>
            ),
        )}
      </div>
    );
  }

  handleClickItem(index: number) {
    this.items.map(item => {
      if (item.active) {
        item.active = false;
      }
    });

    this.items[index].active = true;

    this.clickItem.emit(index);
  }
}
