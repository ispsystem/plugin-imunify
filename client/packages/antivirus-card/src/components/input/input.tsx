import { Component, h, Prop, Host, Event, EventEmitter, State } from '@stencil/core';
import { getValidator, Validator, defaultValidator } from '../../utils/validators';

/**
 * Input field with custom logic and style
 */
@Component({
  tag: 'antivirus-card-input',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Input {
  /** Ref for prefix element */
  prefixElement: HTMLSpanElement;

  /** Ref for input element */
  inputElement: HTMLInputElement;

  /** Field with merged custom validators */
  private _validator: Validator<string> = defaultValidator;

  /** State with result of validate */
  @State() validateResult = true;

  /** Value for input field */
  @Prop({ mutable: true }) value: string;

  /** Style width for input field */
  @Prop({ reflect: true }) width = '280px';

  /** List of custom validators */
  @Prop() validator: Validator<string> | Validator<string>[];

  /** Value for input placeholder */
  @Prop({ reflect: true }) placeholder: string;

  /** Flag for disable input field */
  @Prop({ reflect: true }) disabled: boolean;

  /** Flag for display inline */
  @Prop({ reflect: true }) inlineBlock: boolean;

  /** Text prefix  */
  @Prop({ reflect: true }) textPrefix: string;

  /** Event for input value changed */
  @Event({ bubbles: false }) changed: EventEmitter<string>;

  /** Input type in HTML format */
  @Prop({ reflect: true }) type: 'text' | 'number' = 'text';

  componentWillLoad() {
    this._validator =
      this.validator && (Array.isArray(this.validator) ? getValidator<string>(this.validator) : getValidator<string>([this.validator]));
  }

  componentDidLoad() {
    this.inputElement.style.paddingLeft = 10 + (this.prefixElement && this.prefixElement.clientWidth) + 'px';
  }

  /**
   * Method for update validation result
   * @param value - value for validation
   */
  updateValidator(value: string) {
    if (this._validator) {
      this.validateResult = this._validator.validate(value);
    }
  }

  /**
   * Method to emit new value of input
   * @param event - event from input field
   */
  inputChanged(event: Event) {
    this.value = event.target ? (event.target as HTMLInputElement).value : null;
    this.changed.emit(this.value);
  }

  /**
   * Method for render validation error
   */
  renderValidation = () => {
    /** @todo: add validation error dropdown this */
    return null;
  };

  render() {
    return (
      <Host>
        {this.textPrefix && (
          <span ref={(el: HTMLSpanElement) => (this.prefixElement = el)} class="input-prefix__span">
            {this.textPrefix}
          </span>
        )}
        <input
          ref={(el: HTMLInputElement) => (this.inputElement = el)}
          value={this.value}
          placeholder={this.placeholder}
          disabled={this.disabled}
          type={this.type}
          class={`input-form ${this.validateResult ? '' : 'input-form_accent'}`}
          onInput={event => this.inputChanged(event)}
          onBlur={() => this.updateValidator(this.value)}
          style={{ width: this.width, display: this.inlineBlock ? 'inline-block' : 'block' }}
        />
        {this.renderValidation()}
      </Host>
    );
  }
}
