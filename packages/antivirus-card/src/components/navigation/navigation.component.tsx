import { Component, Prop, Event, h, EventEmitter } from '@stencil/core';

@Component({
  tag: 'antivirus-card-navigation',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class ButtonComponent {
  @Prop()
  public items: {
    label: string;
    active: boolean;
  }[] = [];

  @Event({
    bubbles: true,
    composed: true
  })
  clickItem: EventEmitter;

  render() {
    return (
      <div style={{ '--ngispui-navigation-border-line-top': '-13px', 'margin-bottom': '20px' }} class="ngispui-navigation">
        {this.items.map((val, index) => (
          <div
            onClick={this.handleClickItem.bind(this, index)}
            class={'ngispui-navigation-item ' + (val.active ? 'ngispui-navigation-item_active' : '')}
          >
            {val.label}
          </div>
        ))}
      </div>
    );
  }

  handleClickItem(index: number, e: MouseEvent) {
    console.log(index, e);

    this.items.map(item => {
      if (item.active) {
        item.active = false;
      }
    });

    this.items[index].active = true;

    this.clickItem.emit(index);
  }
}
