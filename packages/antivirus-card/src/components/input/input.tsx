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
  /** Value for input field */
  @Prop({mutable: true}) value: string;

  /** List of custom validators */
  @Prop() validator: Validator<string> | Array<Validator<string>>;
  
  /** Field with merged custom validators */
  _validator: Validator<string> = defaultValidator;
  
  /** Value for input placeholder */
  @Prop({reflect: true}) placeholder: string;
  
  /** Event for input value changed */
  @Event() changed: EventEmitter<string>;

  /** State with result of validate */
  @State() validateResult: boolean = true;

  componentWillLoad() {
    this._validator = Array.isArray(this.validator) ? getValidator<string>(this.validator) : getValidator<string>([this.validator]);
  }

  updateValidator(value: string) {
    this.validateResult = this._validator.validate(value);
  }

  /**
   * Method to emit new value of input
   * @param event event from input field
   */
  handleChange(event) {
    this.value = event.target ? event.target.value : null;
    this.changed.emit(this.value);
  }

  render() {
    return (
      <Host>
        <input
          value={this.value}
          placeholder={this.placeholder}
          class={`input-form ${this.validateResult ? "" : "input-form_accent"}`}
          onInput={(event) => this.handleChange(event)}
          onBlur={() => this.updateValidator(this.value)}
        />
        {this.renderValidation()}
      </Host>
    );
  }

  renderValidation = () => {
    // @TODO add validation error dropdown this
    return null
  }

}
