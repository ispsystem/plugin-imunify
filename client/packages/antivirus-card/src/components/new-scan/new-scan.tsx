import { Component, h, Host, State, Prop } from '@stencil/core';
import { ITranslate } from '../../models/translate.reducers';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Store } from '@stencil/redux';
import { ScanOption, IntensityType } from '../../models/antivirus/state';
import { CheckMaskBlock } from './CheckMaskBlock';

/** Type for new scan options */
export type NewScanOption = Pick<ScanOption, 'id' | 'intensity' | 'path' | 'checkMask' | 'excludeMask' | 'docroot'>;
/** Type for submitting data on create new scanning */
export type NewScanSubmitOption = Omit<NewScanOption, 'id' | 'docroot'>;

/**
 * New scan settings component
 */
@Component({
  tag: 'antivirus-card-new-scan',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class NewScan {
  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** Model settings for new scan */
  @Prop({ mutable: true }) settingsModel!: NewScanOption;

  /** Translate object */
  @State() t: ITranslate;

  /** Use check files by mask flag  */
  @State() useCheckMask: boolean;

  /** Use check files by exclude mask flag  */
  @State() useExcludeMask: boolean;

  /** State for preloader */
  @State() isPreloader: {
    submit: boolean;
  } = { submit: false };

  componentDidLoad() {
    this.useCheckMask = this.settingsModel.checkMask.length > 0;
    this.useExcludeMask = this.settingsModel.excludeMask.length > 0;
  }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate }));
  }

  /**
   *  Handle for change intensity
   *
   * @param intensity - new intensity
   */
  handleChangeIntensity(intensity: IntensityType): void {
    this.settingsModel = {
      ...this.settingsModel,
      intensity,
    };
  }

  /**
   * Handle for change checkMask
   *
   * @param checkMask - new checkMask
   */
  handleChangeCheckMask(checkMask: string) {
    this.settingsModel = {
      ...this.settingsModel,
      checkMask: checkMask.split(','),
    };
  }

  /**
   * Handle for change excludeMask
   *
   * @param excludeMask - new excludeMask
   */
  handleChangeExcludeMask(excludeMask: string) {
    this.settingsModel = {
      ...this.settingsModel,
      excludeMask: excludeMask.split(','),
    };
  }

  /**
   * Handle for change files path
   *
   * @param excludeMask - new path
   */
  handleChangePath(path: string) {
    /** @TODO add handling for path as array, after this feature realise in backend */
    this.settingsModel.path[0] = path;
    this.settingsModel = { ...this.settingsModel };
  }

  /**
   * Handle for use click scan button
   */
  handleScan() {
    /** @TODO add fetch query for this handle */
    this.isPreloader = { ...this.isPreloader, submit: true };
    const model = this._prepareDataForSubmit(this.settingsModel);
    console.log(model);
    this.isPreloader = { ...this.isPreloader, submit: false };
  }

  /**
   * Handle for use click save button
   */
  handleSave() {
    /** @TODO add fetch query for this handle */
    this.isPreloader = { ...this.isPreloader, submit: true };
    const model = this._prepareDataForSubmit(this.settingsModel);
    console.log(model);
    this.isPreloader = { ...this.isPreloader, submit: false };
  }

  /**
   * Method for prepare data in desired form before submit
   */
  private _prepareDataForSubmit(model: NewScanOption): NewScanSubmitOption {
    return {
      checkMask: this.useCheckMask
        ? model.checkMask.reduce((res: string[], el) => {
            el = el.trim();
            el !== '' && res.push(el);
            return res;
          }, [])
        : [],
      excludeMask: this.useExcludeMask
        ? model.excludeMask.reduce((res: string[], el) => {
            el = el.trim();
            el !== '' && res.push(el);
            return res;
          }, [])
        : [],
      intensity: model.intensity,
      path: model.path,
    };
  }

  render() {
    return (
      <Host>
        <slot name="title" />

        <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'CHECK_FOLDER'])}</span>

        <div class="flex-container form-label">
          <span style={{ 'margin-right': '10px' }}>{this.settingsModel.docroot}/</span>
          <antivirus-card-input
            width="310px"
            value={this.settingsModel.path[0]}
            onChanged={e => {
              this.handleChangePath(e.detail);
              e.stopPropagation();
            }}
          ></antivirus-card-input>
        </div>

        <CheckMaskBlock
          msg={this.t.msg(['SCAN_SETTINGS', 'USE_MASK_FOR_CHECK_FILES'])}
          isActive={this.useCheckMask}
          values={this.settingsModel.checkMask}
          handleChangeCheckbox={(checked: boolean) => (this.useCheckMask = checked)}
          handleChangeInput={this.handleChangeCheckMask.bind(this)}
        >
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CHECK_MASK_HINT'])}</antivirus-card-hint>
        </CheckMaskBlock>

        <CheckMaskBlock
          msg={this.t.msg(['SCAN_SETTINGS', 'USE_MASK_FOR_IGNORE_FILES'])}
          isActive={this.useExcludeMask}
          values={this.settingsModel.excludeMask}
          handleChangeCheckbox={(checked: boolean) => (this.useExcludeMask = checked)}
          handleChangeInput={this.handleChangeExcludeMask.bind(this)}
        >
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CHECK_MASK_HINT'])}</antivirus-card-hint>
        </CheckMaskBlock>

        <div class="flex-container form-label" style={{ 'margin-top': '15px' }}>
          <span>{this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', 'TEXT'])}</span>
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', 'HINT_TEXT'])}</antivirus-card-hint>
        </div>

        <antivirus-card-switcher>
          {['LOW', 'MEDIUM', 'HIGH'].map((type: IntensityType) => (
            <antivirus-card-switcher-option active={this.settingsModel.intensity === type} onClick={() => this.handleChangeIntensity(type)}>
              {this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', type])}
            </antivirus-card-switcher-option>
          ))}
        </antivirus-card-switcher>

        <div style={{ 'margin-top': '30px' }} class="flex-container">
          <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <antivirus-card-button onClick={() => this.handleScan()}>{this.t.msg(['SCAN_SETTINGS', 'BUTTON_SCAN'])}</antivirus-card-button>
          </antivirus-card-preloader>
          <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <a class="link link_indent-left" onClick={() => this.handleSave()}>
              {this.t.msg(['SCAN_SETTINGS', 'BUTTON_SAVE'])}
            </a>
          </antivirus-card-preloader>
          {/** @TODO add handle for cancel button */}
          <a class="link link_indent-left" onClick={() => {}}>
            {this.t.msg(['SCAN_SETTINGS', 'BUTTON_CANCEL'])}
          </a>
        </div>
      </Host>
    );
  }
}
