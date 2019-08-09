import { FunctionalComponent, h } from '@stencil/core';
import { Translate } from '../store/types';
import { AntivirusShieldIcon } from './icons/antivirus-shield';
import { AntivirusShieldDisableIcon } from './icons/antivirus-shield-disable';

/**
 *
 */
interface StaticStateProps {
  t: Translate;
  infectedFilesCount: number;
  handleClickRetryScan: () => void;
  handleClickCure: () => void;
  lastCheck: number;
  disableClick: boolean;
}

/**
 *
 *
 * @param props - properties
 */
export const StaticState: FunctionalComponent<StaticStateProps> = props => {
  const status = props.infectedFilesCount === 0 ? 'SUCCESS' : 'ACCENT';
  const isSuccess = status === 'SUCCESS';
  return [
    <div
      class={`overview-widget-list__item-overflow widget-text_additional widget-text_with-margin-adaptive widget-text_${status.toLowerCase()}`}
    >
      {props.t.msg(['WIDGET', 'STATUS', status], { smart_count: props.infectedFilesCount })}
    </div>,
    isSuccess && props.lastCheck !== null && (
      <div class="overview-widget-list__item-overflow widget-text_additional widget-text_with-margin-adaptive">
        {props.t.msg(['WIDGET', 'LAST_CHECK'], { value: props.lastCheck })}
      </div>
    ),
    <div class="widget-icon_adaptive">{isSuccess ? <AntivirusShieldIcon /> : <AntivirusShieldDisableIcon />}</div>,
    <a
      class="link link_type_hover-dropdown link_size_small link_color_primary"
      style={{ 'line-height': '22px' }}
      rel="noopener noreferrer"
      onClick={!props.disableClick && isSuccess ? props.handleClickRetryScan.bind(this) : props.handleClickCure.bind(this)}
    >
      {isSuccess ? props.t.msg(['WIDGET', 'CHECK_AGAIN']) : props.t.msg(['WIDGET', 'CURE'])}
    </a>,
  ];
};
