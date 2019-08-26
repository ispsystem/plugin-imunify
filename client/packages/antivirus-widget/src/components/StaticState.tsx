import { FunctionalComponent, h } from '@stencil/core';
import { Translate } from '../store/types';
import { AntivirusShieldIcon } from './icons/antivirus-shield';
import { AntivirusShieldDisableIcon } from './icons/antivirus-shield-disable';
import { getDayMonthYearAsStr } from '../utils/utils';

/**
 * Properties for static antivirus state
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
 * Antivirus widget in static state view
 *
 * @param props - properties
 */
export const StaticState: FunctionalComponent<StaticStateProps> = props => {
  const status = props.infectedFilesCount === 0 ? 'SUCCESS' : 'ACCENT';
  const isSuccess = status === 'SUCCESS';

  return [
    props.lastCheck !== null && (
      <div
        class={`overview-widget-list__item-overflow widget-text_additional widget-text_with-margin-adaptive widget-text_${status.toLowerCase()}`}
      >
        {props.t.msg(['WIDGET', 'STATUS', status], { smart_count: props.infectedFilesCount })}
      </div>
    ),
    isSuccess && props.lastCheck !== null && (
      <div class="overview-widget-list__item-overflow widget-text_additional widget-text_with-margin-adaptive">
        {props.t.msg(['WIDGET', 'LAST_CHECK'], { value: getDayMonthYearAsStr(props.lastCheck, props.t) })}
      </div>
    ),
    <div class="widget-icon_adaptive">{isSuccess ? <AntivirusShieldIcon /> : <AntivirusShieldDisableIcon />}</div>,
    <a
      class="link link_type_hover-dropdown link_size_small link_color_primary"
      style={{ 'line-height': '22px' }}
      rel="noopener noreferrer"
      onClick={event => {
        !props.disableClick && (isSuccess ? props.handleClickRetryScan() : props.handleClickCure());
        event.stopPropagation();
      }}
    >
      {!props.lastCheck
        ? props.t.msg(['WIDGET', 'CHECK_SITE'])
        : isSuccess
        ? props.t.msg(['WIDGET', 'CHECK_AGAIN'])
        : props.t.msg(['WIDGET', 'CURE'])}
    </a>,
  ];
};
