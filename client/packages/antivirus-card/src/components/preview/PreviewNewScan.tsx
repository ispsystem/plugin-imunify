import { FunctionalComponent, h } from '@stencil/core';
import { NewScanIcon } from '../icons/NewScanIcon';

/**
 * PreviewNewScan component props
 */
interface PreviewNewScanProps {
  text: string;
  onClick: (event: MouseEvent) => void;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewNewScan: FunctionalComponent<PreviewNewScanProps> = props => (
  <section onClick={props.onClick.bind(this)} class="antivirus-card-preview__pro">
    <div>
      <NewScanIcon></NewScanIcon>
    </div>
    <p>{props.text}</p>
  </section>
);
