import { Component, h, Prop, Watch, EventEmitter, Event } from '@stencil/core';
import { DeleteIcon } from '../icons/delete';

/**
 * Zoom field component
 */
@Component({
  tag: 'antivirus-card-zoom',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Zoom {
  /** The number of fields that cannot be deleted */
  @Prop() notDelCount = 0;

  /** Values for initial fields */
  @Prop({ mutable: true }) values: string[] = [''];

  @Watch('values')
  updateValues() {
    this.changed.emit(this.values);
  }

  /** Change values event */
  @Event({ bubbles: false }) changed: EventEmitter<string[]>;

  componentDidLoad() {
    while (this.values.length < this.notDelCount) {
      this.values = [...this.values, ''];
    }
  }

  /**
   * Method for delete field in values by index
   * @param index - element index
   */
  deleteField(index: number) {
    this.values.splice(index, 1);
    this.values = [...this.values];
  }

  /**
   * Method for update field value by index
   * @param newValue - new value for element
   * @param index - element index
   */
  updateValue(newValue: string, index: number) {
    this.values[index] = newValue;
    this.values = [...this.values];
  }

  render() {
    return (
      <div>
        <div class="fields-container">
          {this.values.map((value, index) => (
            <div>
              <antivirus-card-input
                inlineBlock
                value={value}
                onChanged={event => {
                  event.stopPropagation();
                  this.updateValue(event.detail, index);
                }}
              />
              {index >= this.notDelCount && (
                <span onClick={() => this.deleteField(index)}>
                  <DeleteIcon />
                </span>
              )}
            </div>
          ))}
        </div>
        <a class="isp-link" style={{ 'margin-top': '5px' }} onClick={() => (this.values = [...this.values, ''])}>
          <slot />
        </a>
        <slot name="additionText" />
      </div>
    );
  }
}
