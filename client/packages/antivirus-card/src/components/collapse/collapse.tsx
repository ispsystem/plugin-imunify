import { h, Component, Method, Prop } from '@stencil/core';

/**
 * Custom collapse component
 */
@Component({
  tag: 'antivirus-card-collapse',
  styleUrl: 'styles/$.scss',
})
export class Collapse {
  @Prop() isOpen = false;

  @Prop() text!: { open: string; close: string };

  @Method()
  async toggle(value?: boolean) {
    this.isOpen = value ? value : !this.isOpen;
  }
  render() {
    return (
      <div class="collapse">
        <div class={`collapse__button${this.isOpen ? ' open' : ''}`} onClick={() => this.toggle()}>
          <span class="collapse-text">{this.isOpen ? this.text.open : this.text.close}</span>
        </div>
        <div style={this.isOpen && { display: 'block' }} class="collapse__content">
          <slot />
        </div>
      </div>
    );
  }
}
