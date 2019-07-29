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
  /** Host element */
  @Element()
  private _host: HTMLElement;

  /** State for select panel */
  @State()
  public openPanel = false;

  /** Disabled key for select field */
  @Prop({ reflect: true })
  public disabled: boolean;

  /** Placeholder for select field */
  @Prop({ reflect: true })
  public placeholder: string;

  /** Selected value */
  @Prop({ mutable: true })
  public selectedValue: SelectedOption;

  @Watch('selectedValue')
  changeValue(newValue: SelectedOption, oldValue: SelectedOption) {
    if (newValue !== oldValue) {
      const slotted = this._host.shadowRoot.querySelector('slot');
      slotted.assignedNodes().forEach((el: HTMLAntivirusCardSelectOptionElement) => (el.selected = el.value === newValue.v));
    }
  }

  componentDidLoad() {
    if (this.selectedValue !== undefined) {
      const slotted = this._host.shadowRoot.querySelector('slot');
      slotted.assignedNodes().forEach((el: HTMLAntivirusCardSelectOptionElement) => (el.selected = el.value === this.selectedValue.v));
    }
  }

  /** Handle for change selected value */
  @Event()
  public changed: EventEmitter<SelectedOption['v']>;

  /**
   * Listen change selected option status
   *
   * @param event - new selected value
   */
  @Listen('changedSelectStatus', { capture: true })
  changeSelectOption(event: CustomEvent<SelectedOption>): void {
    this.selectedValue = event.detail;
    this.changed.emit(this.selectedValue.v);
    if (this.openPanel) {
      this.openPanel = false;
    }
  }

  /**
   * Listen click for definitions click outside select
   *
   * @param event - DOM event
   */
  @Listen('click', { target: 'document' })
  clickOutside(event: Event): void {
    const composedPath = event.composedPath()[0] as Node;
    if (this.openPanel && !(this._host.contains(composedPath) || this._host.shadowRoot.contains(composedPath))) {
      this.openPanel = false;
    }
  }

  render() {
    return (
      <Host>
        <div onClick={() => (this.openPanel = !this.openPanel)} class="select-container">
          <span class="select__value">
            <span class="select__value-text">{this.selectedValue ? this.selectedValue.k : null}</span>
          </span>
          <span class="select__arrow"></span>
        </div>
        <div class="select__panel" style={!this.openPanel && { display: 'none' }}>
          <div class="select__options">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
