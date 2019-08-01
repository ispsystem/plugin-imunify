import { FunctionalComponent, h } from '@stencil/core';

/**
 * CheckInput component props
 */
interface CheckInputProps {
  msg: string;
  isActive: boolean;
  value: string;
  inputWrapperClass?: string;
  inputPlaceholder?: string;
  handleChangeCheckbox: (checked: boolean) => void;
  handleChangeInput: (checkMask: string) => void;
}

/**
 * Render checkbox with input field
 *
 * @param props - properties
 */
export const CheckInput: FunctionalComponent<CheckInputProps> = (props, children) => [
  <CheckInputCheckbox msg={props.msg} handleChangeCheckbox={props.handleChangeCheckbox} isActive={props.isActive} />,
  <div class={props.inputWrapperClass ? props.inputWrapperClass : ''} style={!props.isActive && { display: 'none' }}>
    <CheckInputInput inputPlaceholder={props.inputPlaceholder} handleChangeInput={props.handleChangeInput} value={props.value} />
    {children}
  </div>,
];

/**
 * Render checkbox
 *
 * @param props - properties
 */
const CheckInputCheckbox: FunctionalComponent<
  Omit<CheckInputProps, 'value' | 'handleChangeInput' | 'inputPlaceholder' | 'inputWrapperClass'>
> = props => (
  <antivirus-card-checkbox
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
 * Render input
 *
 * @param props - properties
 */
const CheckInputInput: FunctionalComponent<Pick<CheckInputProps, 'handleChangeInput' | 'value' | 'inputPlaceholder'>> = props => (
  <antivirus-card-input
    onChanged={event => {
      props.handleChangeInput(event.detail);
      event.stopPropagation();
    }}
    value={props.value}
    placeholder={props.inputPlaceholder ? props.inputPlaceholder : ''}
  ></antivirus-card-input>
);
