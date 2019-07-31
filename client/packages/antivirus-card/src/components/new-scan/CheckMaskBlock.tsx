import { FunctionalComponent, h } from '@stencil/core';

/**
 * CheckMask component props
 */
interface CheckMaskBlockProps {
  msg: string;
  isActive: boolean;
  values: string[];
  handleChangeCheckbox: (checked: boolean) => void;
  handleChangeInput: (checkMask: string) => void;
}

/**
 * Render checkbox with input from check mask field
 *
 * @param props - properties
 */
export const CheckMaskBlock: FunctionalComponent<CheckMaskBlockProps> = (props, children) => [
  <CheckMaskCheckbox msg={props.msg} handleChangeCheckbox={props.handleChangeCheckbox} isActive={props.isActive} />,
  <div class="flex-container" style={!props.isActive && { display: 'none' }}>
    <CheckMaskInput handleChangeInput={props.handleChangeInput} values={props.values} />
    {children}
  </div>,
];

/**
 * Render check mask checkbox
 *
 * @param props - properties
 */
const CheckMaskCheckbox: FunctionalComponent<Pick<CheckMaskBlockProps, 'handleChangeCheckbox' | 'msg' | 'isActive'>> = props => (
  <antivirus-card-checkbox
    class="form-label"
    checked={props.isActive}
    onChanged={event => {
      props.handleChangeCheckbox(event.detail);
      event.stopPropagation();
    }}
  >
    {props.msg}
  </antivirus-card-checkbox>
);

/**
 * Render check mask input field
 *
 * @param props - properties
 */
const CheckMaskInput: FunctionalComponent<Pick<CheckMaskBlockProps, 'handleChangeInput' | 'values'>> = props => (
  <antivirus-card-input
    onChanged={event => {
      props.handleChangeInput(event.detail);
      event.stopPropagation();
    }}
    value={props.values.join(',')}
    placeholder="*.php, *.htm*"
  ></antivirus-card-input>
);
