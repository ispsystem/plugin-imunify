import { Component, h, Prop, Method } from '@stencil/core';
import { CloseIcon } from '../icons/close';

@Component({
  tag: 'antivirus-card-modal',
  styleUrl: './styles/$.scss',
  shadow: true,
})
export class Modal {
  /** Modal width */
  @Prop({ attribute: 'modal-width' }) modalWidth: string;

  /** Flag for visible component */
  @Prop({
    mutable: true,
    reflect: true,
  })
  visible: boolean;

  /**
   * Method for change modal visible
   */
  @Method()
  async toggle(value?: boolean) {
    this.visible = value ? value : !this.visible;
  }

  /**
   * Handle for click on modal
   *
   * @param e - mouse event
   */
  private handleModalClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  render() {
    return (
      <div class={this.visible ? 'wrapper visible' : 'wrapper'} onClick={() => this.toggle()}>
        <div style={{ width: this.modalWidth }} class="modal" onClick={this.handleModalClick}>
          <span class="modal-close" onClick={() => this.toggle()}>
            <CloseIcon />
          </span>
          <slot />
        </div>
      </div>
    );
  }
}
