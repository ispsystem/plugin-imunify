import { FunctionalComponent, h } from '@stencil/core';
import { AntivirusSpinnerRound } from './icons/spinner-round';

/**
 *
 */
interface ActiveStateProps {
  desc: string;
  handleClickCancel: (event: Event) => void;
}

/**
 *
 *
 * @param props - properties
 */
export const ActiveState: FunctionalComponent<ActiveStateProps> = props => [
  <div class="overview-widget-list__item-overflow widget-text_additional widget-text_with-margin-adaptive">{props.desc}</div>,
  <div class="antivirus-card-spinner-round">
    <AntivirusSpinnerRound />
  </div>,
];
