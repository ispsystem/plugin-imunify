import { Component, h, Prop, Host, Event, Listen, EventEmitter } from '@stencil/core';

/**
 * Custom checkbox component
 */
@Component({
  tag: 'antivirus-card-checkbox',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class Checkbox {
  /** Value for checkbox */
  @Prop({ reflect: true }) checked: boolean;

  /** Flag fore display type block  */
  @Prop({ reflect: true }) block: boolean;

  /** Bold highlight active checkbox text */
  @Prop({ reflect: true }) bold: boolean;

  /** Text wrapping around the checkbox */
  @Prop({ reflect: true }) unwrap: boolean;

  /** Make read only available */
  @Prop() readonly: boolean;

  /** Event by change checkbox value */
  @Event() сhanged: EventEmitter<boolean>;

  /** 
   * Listen onclick on host element
   */
  @Listen('click', { capture: true })
  onClick() {
    if (!this.readonly){
      this.checked = !this.checked;
      this.сhanged.emit(this.checked)
    }
  }

  render() {
    return (
      <Host>
        <input
          class="checkbox__element"
          type="checkbox"
          checked={this.checked}
          disabled={this.readonly}
        />
        <label class="checkbox__control">
          <span class="checkbox__control-text">
            <slot/>
          </span>
        </label>
      </Host>
    );
  }
}
