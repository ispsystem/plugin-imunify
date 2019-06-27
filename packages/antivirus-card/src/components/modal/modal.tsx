import { Component, h, Prop } from '@stencil/core';
import { CloseIcon } from '../icons/close';

@Component({
  tag: 'antivirus-card-modal',
  styleUrl: './styles/$.scss',
  shadow: true
})
export class Modal {
  @Prop({ attribute: 'modal-width' }) public modalWidth: string;
  @Prop() public title: string;
  @Prop({
    mutable: true,
    reflect: true
  })
  public visible: boolean;

  private handleCancelClick = () => {
    this.visible = false;
  };

  private handleModalClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  public render() {
    return (
      <div class={this.visible ? 'wrapper visible' : 'wrapper'} onClick={this.handleCancelClick}>
        <div style={{ width: this.modalWidth }} class="modal" onClick={this.handleModalClick}>
          <span class="modal-close" onClick={this.handleCancelClick}>
            <CloseIcon />
          </span>
          <slot />
        </div>
      </div>
    );
  }
}
