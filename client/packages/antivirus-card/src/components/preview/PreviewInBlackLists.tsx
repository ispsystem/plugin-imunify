import { FunctionalComponent, h } from '@stencil/core';
import { Translate } from '../../models/translate.reducers';
import { CheckListGoodIcon } from '../icons/check-list-good';
import { CheckListBadIcon } from '../icons/check-list-bad';

/**
 * PreviewInfectedFiles component props
 */
interface PreviewInBlackListsProps {
  t: Translate;
  inBlackLists: boolean;
  dropdownElToggle: (e: MouseEvent) => void;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewInBlackLists: FunctionalComponent<PreviewInBlackListsProps> = props =>
  props.inBlackLists ? (
    <div class="antivirus-card-preview__container">
      <CheckListBadIcon />
      <div class="antivirus-card-preview__container-msg">
        <span>{props.t.msg(['PREVIEW', 'IN_BLACK_LISTS'])}</span>
        <div style={{ display: 'inline' }}>
          <a onClick={props.dropdownElToggle} class="link link_small">
            {props.t.msg(['PREVIEW', 'HOW_TO_FIX'])}
          </a>
        </div>
      </div>
    </div>
  ) : (
    <div class="antivirus-card-preview__container">
      <CheckListGoodIcon />
      <div class="antivirus-card-preview__container-msg">
        <span>{props.t.msg(['PREVIEW', 'NOT_IN_BLACK_LISTS'])}</span>
      </div>
    </div>
  );
