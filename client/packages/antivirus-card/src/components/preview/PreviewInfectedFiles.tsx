import { FunctionalComponent, h, EventEmitter } from '@stencil/core';
import { VirusesCheckGoodIcon } from '../icons/viruses-check-good';
import { VirusesCheckBadIcon } from '../icons/viruses-check-bad';
import { ITranslate } from '../../models/translate.reducers';

/**
 * PreviewInfectedFiles component props
 */
interface PreviewInfectedFilesProps {
  t: ITranslate;
  infectedFilesCount: number;
  clickItem: EventEmitter;
  openBuyModal: EventEmitter;
  isProVersion: boolean;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewInfectedFiles: FunctionalComponent<PreviewInfectedFilesProps> = props =>
  props.infectedFilesCount > 0 ? (
    <div class="antivirus-card-preview__container">
      <VirusesCheckBadIcon />
      <div class="antivirus-card-preview__container-msg">
        <span>
          {props.t.msg(['PREVIEW', 'INFECTED_FILES_WORD_1'], props.infectedFilesCount)} {props.infectedFilesCount}{' '}
          {props.t.msg(['PREVIEW', 'INFECTED_FILES_WORD_2'], props.infectedFilesCount)}
        </span>
        <div style={{ display: 'inline' }}>
          <a
            class="link link_small link_indent-right"
            onClick={() => {
              props.isProVersion
                ? () => {
                    throw 'disinfectVirusFiles';
                  }
                : props.openBuyModal.emit();
            }}
          >
            {props.t.msg(['PREVIEW', 'CURE'])}
          </a>
          <a class="link link_small" onClick={() => props.clickItem.emit(1)}>
            {props.t.msg(['PREVIEW', 'DETAIL'])}
          </a>
        </div>
      </div>
    </div>
  ) : (
    <div class="antivirus-card-preview__container">
      <VirusesCheckGoodIcon />
      <div class="antivirus-card-preview__container-msg">
        <span>{props.t.msg(['PREVIEW', 'NOT_INFECTED_FILES'])}</span>
      </div>
    </div>
  );