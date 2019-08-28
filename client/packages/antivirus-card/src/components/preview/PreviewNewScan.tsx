import { FunctionalComponent, h } from '@stencil/core';
import { NewScanIcon } from '../icons/NewScanIcon';

/**
 * PreviewNewScan component props
 */
interface PreviewNewScanProps {
  text: string;
  onClick: (event: MouseEvent) => void;
  scanning: boolean;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewNewScan: FunctionalComponent<PreviewNewScanProps> = props => (
  <section
    onClick={ev => (props.scanning ? ev.preventDefault() : props.onClick(ev))}
    class={`antivirus-card-preview__pro${props.scanning ? ' disabled' : ''}`}
  >
    <div>
      <NewScanIcon disabled={props.scanning} />
    </div>
    <p>{props.text}</p>
  </section>
);
