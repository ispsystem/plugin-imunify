import { Component, h, Host, Prop } from '@stencil/core';
import { QuestionIcon } from '../icons/question';
import { DropdownElType } from '../dropdown/dropdown';
import { QuestionAccentIcon } from '../icons/question-accent';

@Component({
  tag: 'antivirus-card-hint',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class Hint {
  /** Ref for dropdown element */
  public dropdownEl!: DropdownElType;

  @Prop({reflect: true}) accent: boolean;

  render() {
    return (
      <Host>
        <div
          class="hint-icon"
          onClick={(ev: MouseEvent) => this.dropdownEl.toogle(ev)}
        >
          {this.accent ? <QuestionAccentIcon /> : <QuestionIcon />}
        </div>
        <antivirus-card-dropdown ref={(el: DropdownElType) => this.dropdownEl = el}>
          <slot />
        </antivirus-card-dropdown>
      </Host>
    );
  }
}
