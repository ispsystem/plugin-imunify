import { FunctionalComponent, h } from '@stencil/core';

/**
 * PreviewStatus component props
 */
interface PreviewStatusProps {
  scanning: boolean;
  msgWaitCheck: string;
  msgLastCheck: string;
  lastScan: string;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewStatus: FunctionalComponent<PreviewStatusProps> = props =>
  props.scanning ? (
    <div style={{ display: 'flex' }}>
      <p class="before-check">{props.msgWaitCheck}</p>
      <div class="antivirus-card-preview__spinner">
        <antivirus-card-spinner-round />
      </div>
    </div>
  ) : (
    <p class="before-check">
      {props.msgLastCheck} {props.lastScan}
    </p>
  );
