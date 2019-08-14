import { h, Listen, Prop, Event, EventEmitter, Component, Element, Host, State, Watch } from '@stencil/core';

/** Interface for common selected option */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SelectedOption<T = any> {
  k: string;
  v: T;
}

/**
 * Custom select component
 */
@Component({
  tag: 'antivirus-card-select',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Select {
  /** Ref for select container element */
  selectContainer: HTMLDivElement;

  /** Host element */
  @Element() _host: HTMLElement;

  /** State for select panel */
  @State() openPanel = false;

  /** Disabled key for select field */
  @Prop({ reflect: true }) disabled: boolean;

  /** Width for select block */
  @Prop({ reflect: true }) width = 280;

  /** Placeholder for select field */
  @Prop({ reflect: true }) placeholder: string;

  /** Flag for disable border around select */
  @Prop({ reflect: true }) borderless: boolean;

  /**
   * Margin top value for select panel
   * @todo calculate this parameter
   */
  @Prop({ reflect: true }) marginTop: number;

  /** Selected value */
  @Prop({ mutable: true }) selectedValue: SelectedOption;

  @Watch('selectedValue')
  changeValue(newValue: SelectedOption, oldValue: SelectedOption) {
    if (newValue !== oldValue) {
      const slotted = this._host.shadowRoot.querySelector('slot');
      slotted.assignedNodes().forEach((el: HTMLAntivirusCardSelectOptionElement) => (el.selected = el.value === newValue.v));
    }
  }

  /** Handle for change selected value */
  @Event() changed: EventEmitter<SelectedOption['v']>;

  /**
   * Listen change selected option status
   *
   * @param event - new selected value
   */
  @Listen('changedSelectStatus', { capture: true })
  changeSelectOption(event: CustomEvent<SelectedOption>): void {
    this.selectedValue = event.detail;
    this.changed.emit(this.selectedValue.v);
  }

  /**
   * Listen click for definitions click outside select
   *
   * @param event - DOM event
   */
  @Listen('click', { target: 'document' })
  clickOutside(event: Event): void {
    const composedPath = event.composedPath()[0] as Node;
    this.openPanel = this.selectContainer.contains(composedPath) ? !this.openPanel : this._host.shadowRoot.contains(composedPath);
  }

  componentDidLoad() {
    if (this.selectedValue !== undefined) {
      const slotted = this._host.shadowRoot.querySelector('slot');
      slotted.assignedNodes().forEach((el: HTMLAntivirusCardSelectOptionElement) => (el.selected = el.value === this.selectedValue.v));
    }
  }

  render() {
    return (
      <Host>
        <div
          ref={(el: HTMLDivElement) => (this.selectContainer = el)}
          class={`select-container${this.disabled ? ' disabled' : ''} ${this.borderless ? 'borderless' : ''}`}
          style={{ width: `${this.width}px` }}
        >
          <span class="select__value">
            <span class="select__value-text">{this.selectedValue ? this.selectedValue.k : null}</span>
          </span>
          <span class="select__arrow"></span>
        </div>
        <div
          class="select__panel"
          style={{ display: !this.openPanel ? 'none' : 'block', width: `${this.width - 20}px`, 'margin-top': `${this.marginTop}px` }}
        >
          <div class="select__options">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
