import { Component, h, Prop, Method, Listen } from '@stencil/core';
import { CloseIcon } from '../icons/close';

@Component({
  tag: 'antivirus-card-modal',
  styleUrl: './styles/$.scss',
  shadow: true,
})
export class Modal {
  /** Ref for modal element */
  modalElement: HTMLDivElement;

  /** Ref for modal wrapper element */
  modalWrapper: HTMLDivElement;

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
   * Listen click for definitions click outside modal
   *
   * @param event - DOM event
   */
  @Listen('click', { target: 'document' })
  clickOutside(event: Event): void {
    const composedPath = event.composedPath()[0] as Node;
    if (!this.modalElement.contains(composedPath) && this.modalWrapper.contains(composedPath)) {
      this.visible = false;
    }
  }

  render() {
    return (
      <div class={this.visible ? 'wrapper visible' : 'wrapper'} ref={el => (this.modalWrapper = el)}>
        <div style={{ width: this.modalWidth }} class="modal" ref={el => (this.modalElement = el)}>
          <span class="modal-close" onClick={() => this.toggle()}>
            <CloseIcon />
          </span>
          <slot />
        </div>
      </div>
    );
  }
}
