import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'antivirus-card-buy-modal',
  styleUrl: './styles/$.scss',
  shadow: true
})
export class BuyModal {
  @Prop() public title: string;
  @Prop({
    mutable: true,
    reflectToAttr: true
  })
  public visible: boolean;

  private handleCancelClick = () => {
    this.visible = false;
  };

  private handleOkClick = () => {
    this.visible = false;
  };

  public render() {
    return (
      <div class={this.visible ? 'wrapper visible' : 'wrapper'}>
        <div class="modal">
          <span class="title">{this.title}</span>
          <div class="content">
            <slot />
          </div>
          <div class="button-container">
            <button class="cancel" onClick={this.handleCancelClick}>
              Cancel
            </button>
            <button class="ok" onClick={this.handleOkClick}>
              Okay
            </button>
          </div>
        </div>
      </div>
    );
  }
}
