import { Component, h, Host, Prop } from '@stencil/core';
import { QuestionIcon } from '../icons/question';
import { QuestionAccentIcon } from '../icons/question-accent';

@Component({
  tag: 'antivirus-card-hint',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class Hint {
  /** Ref for dropdown element */
  public dropdownEl!: HTMLAntivirusCardDropdownElement;

  /** Flag for display accent icon */
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
        <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => this.dropdownEl = el}>
          <slot />
        </antivirus-card-dropdown>
      </Host>
    );
  }
}
