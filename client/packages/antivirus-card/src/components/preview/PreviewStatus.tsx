import { FunctionalComponent, h } from '@stencil/core';
import { ITranslate } from '../../models/translate.reducers';
import { getDayMonthYearAsStr, getTimeAsStr } from '../../utils/tools';
import { CheckType } from '../../models/antivirus/state';

/**
 * PreviewStatus component props
 */
interface PreviewStatusProps {
  scanning: false | CheckType;
  t: ITranslate;
  type: CheckType;
  lastScanDate: number;
  pathList?: string[];
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewStatus: FunctionalComponent<PreviewStatusProps> = props =>
  props.scanning === props.type ? (
    <div style={{ display: 'flex' }}>
      <p class="before-check">{props.t.msg(['PREVIEW', 'WAIT_CHECK', props.type])}</p>
      <div class="antivirus-card-preview__spinner">
        <antivirus-card-spinner-round />
      </div>
    </div>
  ) : (
    <p class="before-check">
      <span class="check-path">
        {props.t.msg(['PREVIEW', 'LAST_CHECK', props.type], {
          directory: Array.isArray(props.pathList) && props.pathList.length > 0 ? props.pathList[0] : '',
        })}
      </span>
      {props.lastScanDate > 0 && (
        <span style={{ 'margin-right': '40px' }}>
          {props.t.msg(['LAST_CHECK_IN'], {
            date: getDayMonthYearAsStr(new Date(props.lastScanDate), props.t),
            time: getTimeAsStr(new Date(props.lastScanDate)),
          })}
        </span>
      )}
    </p>
  );
