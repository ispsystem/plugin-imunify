import { Component, Prop, h } from '@stencil/core';
import { ButtonType, ThemePalette } from './button.interface';

@Component({
  tag: 'antivirus-card-button',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class ButtonComponent {
  @Prop({ attribute: 'btn-type' })
  btnType: ButtonType = ButtonType.button;
  @Prop({ attribute: 'is-disabled' })
  isDisabled = false;
  @Prop({ attribute: 'btn-theme' })
  theme: ThemePalette = ThemePalette.primary;
  @Prop({ attribute: 'custom-css-class' })
  customCSSClass = '';

  render() {
    return (
      <button
        class={'ngispui-button ' + this.customCSSClass + 'ngispui-button_type_' + ThemePalette[this.theme]}
        type={this.btnType}
        disabled={this.isDisabled}
      >
        <slot />
      </button>
    );
  }
}
