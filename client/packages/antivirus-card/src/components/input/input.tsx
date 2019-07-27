import { Component, h, Prop, Host, Event, EventEmitter, State } from '@stencil/core';
import { getValidator, Validator, defaultValidator } from '../../utils/validators';

/**
 * Input field with custom logic and style
 */
@Component({
  tag: 'antivirus-card-input',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class Input {
  /** Field with merged custom validators */
  private _validator: Validator<string> = defaultValidator;

  /** State with result of validate */
  @State() validateResult = true;

  /** Value for input field */
  @Prop({mutable: true}) value: string;

  /** List of custom validators */
  @Prop() validator: Validator<string> | Array<Validator<string>>;
  
  /** Value for input placeholder */
  @Prop({reflect: true}) placeholder: string;

  /** Flag for disable input field */
  @Prop({reflect: true}) disabled: boolean;

  @Prop({reflect: true}) inlineBlock: boolean;
  
  /** Event for input value changed */
  @Event({ bubbles: false }) changed: EventEmitter<string>;

  componentWillLoad() {
    this._validator = this.validator && (Array.isArray(this.validator) 
      ? getValidator<string>(this.validator) 
      : getValidator<string>([this.validator]));
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
    return null
  }

  render() {
    return (
      <Host>
        <input
          value={this.value}
          placeholder={this.placeholder}
          disabled={this.disabled}
          class={`input-form ${this.validateResult ? "" : "input-form_accent"}`}
          onInput={(event) => this.inputChanged(event)}
          onBlur={() => this.updateValidator(this.value)}
          style={this.inlineBlock && {display: 'inline-block'}}
        />
        {this.renderValidation()}
      </Host>
    );
  }

}
