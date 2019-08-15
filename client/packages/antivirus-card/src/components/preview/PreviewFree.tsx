import { FunctionalComponent, h } from '@stencil/core';
import { ImunifyLogo } from '../icons/ImunifyLogo';

/**
 * PreviewFree component props
 */
interface PreviewFreeProps {
  title: string;
  text?: string;
  onClick: (event: MouseEvent) => void;
}

/**
 * Functional component
 *
 * @param props - properties
 */
export const PreviewFree: FunctionalComponent<PreviewFreeProps> = props => (
  <section onClick={props.onClick.bind(this)} class="antivirus-card-preview__free">
    <h4 class="antivirus-card-preview__free-title">{props.title}</h4>
    {Boolean(props.text) && <p class="antivirus-card-preview__free-msg">{props.text}</p>}
    <div class="antivirus-card-preview__free-icon">
      <ImunifyLogo />
    </div>
  </section>
);
