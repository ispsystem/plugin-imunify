import { FunctionalComponent, h } from '@stencil/core';
import { ImunifyLogo } from '../icons/ImunifyLogo';
import { Translate } from '../../models/translate.reducers';

/**
 * PreviewPurchase component props
 */
interface PreviewPurchaseProps {
  t: Translate;
}

/**
 * Preview purchase status for
 *
 * @param props - properties
 */
export const PreviewPurchase: FunctionalComponent<PreviewPurchaseProps> = props => (
  <section class="antivirus-card-preview__purchase">
    <span class="antivirus-card-preview__purchase-title">{props.t.msg(['PURCHASE', 'PREVIEW', 'TITLE'])}</span>
    <p class="antivirus-card-preview__purchase-msg">{props.t.msg(['PURCHASE', 'PREVIEW', 'MSG'])}</p>
    <div class="antivirus-card-preview__purchase-icon">
      <ImunifyLogo color="#344A5E" />
      {props}
    </div>
  </section>
);
