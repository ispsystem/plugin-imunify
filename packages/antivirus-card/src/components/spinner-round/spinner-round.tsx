import { Component, Prop, h, State } from '@stencil/core';
import { uuidv4 } from '../../utils/tools';

@Component({
  tag: 'antivirus-card-spinner-round',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class SpinnerRound {
  @State()
  uuid = uuidv4();

  render() {
    return (
      <div class="antivirus-card-spinner-round">
        <svg class="circular" viewBox="25 25 50 50">
          <defs>
            <linearGradient x1="100%" y1="10%" x2="35%" y2="100%" id={this.uuid}>
              <stop class="antivirus-card-spinner-round__linear-gradient-stop" offset="0%" />
              <stop class="antivirus-card-spinner-round__linear-gradient-stop" stop-opacity="0.001" offset="100%" />
            </linearGradient>
          </defs>
          <circle
            class="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke-width="3"
            stroke={'url(#' + this.uuid + ')'}
            stroke-miterlimit="10"
          />
        </svg>
      </div>
    );
  }
}
