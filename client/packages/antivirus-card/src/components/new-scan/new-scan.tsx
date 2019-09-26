import { Component, h, Host, State, Prop } from '@stencil/core';
import { Translate } from '../../models/translate.reducers';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Store } from '@stencil/redux';
import { ScanOption, IntensityType } from '../../models/antivirus/state';
import { CheckByMask } from './CheckByMask';
import { AntivirusActions } from '../../models/antivirus/actions';
import { filterEmptyString } from '../../utils/tools';
import { ISPNotifier } from '@ispsystem/notice-tools';

/**
 * New scan settings component
 */
@Component({
  tag: 'antivirus-card-new-scan',
  styleUrls: ['styles/$.scss', '../style.scss'],
  shadow: true,
})
export class NewScan {
  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** global notifier object */
  @State() notifier: ISPNotifier;

  /** Function on modal close */
  @Prop() closeModal = async () => {};

  /** Model settings for new scan */
  @Prop({ mutable: true }) preset!: ScanOption;

  /** Translate object */
  @State() t: Translate;

  /** Site id */
  @State() siteId: number;

  /** Use check files by mask flag  */
  @State() useCheckMask: boolean;

  /** Use check files by exclude mask flag  */
  @State() useExcludeMask: boolean;

  /** State for preloader */
  @State() isPreloader = { submit: false };

  /** Method to update global state */
  savePreset: typeof AntivirusActions.savePreset;

  /** Action save and scan */
  saveAndScan: typeof AntivirusActions.saveAndScan;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate, notifier: state.notifier, siteId: state.siteId }));
    this.store.mapDispatchToProps(this, {
      savePreset: AntivirusActions.savePreset,
      saveAndScan: AntivirusActions.saveAndScan,
    });
  }

  componentDidLoad() {
    this.useCheckMask = this.preset.checkMask.length > 0;
    this.useExcludeMask = this.preset.excludeMask.length > 0;
  }

  /**
   *  Handle for change intensity
   *
   * @param intensity - new intensity
   */
  handleChangeIntensity(intensity: IntensityType): void {
    this.preset = {
      ...this.preset,
      intensity,
    };
  }

  /**
   * Handle for change checkMask
   *
   * @param checkMask - new checkMask
   */
  handleChangeCheckMask(checkMask: string) {
    this.preset = {
      ...this.preset,
      checkMask: checkMask.split(','),
    };
  }

  /**
   * Handle for change excludeMask
   *
   * @param excludeMask - new excludeMask
   */
  handleChangeExcludeMask(excludeMask: string) {
    this.preset = {
      ...this.preset,
      excludeMask: excludeMask.split(','),
    };
  }

  /**
   * Handle for change files path
   *
   * @param excludeMask - new path
   */
  handleChangePath(path: string) {
    /** @todo add handling for path as array, after this feature realise in backend */
    this.preset.path[0] = path;
    this.preset = { ...this.preset };
  }

  /**
   * Handle for use click scan button
   */
  async handleScan() {
    this.isPreloader = { ...this.isPreloader, submit: true };
    const preset = this.prepareDataForSubmit(this.preset);
    const res = await this.saveAndScan(preset, this.siteId);
    this.isPreloader = { ...this.isPreloader, submit: false };
    if (res && res['error']) {
      console.warn('Oops, failed to save preset or start scanning', res['error']);
      return;
    } else {
      await this.closeModal();
    }
  }

  /**
   * Handle for use click save button
   */
  async handleSave() {
    this.isPreloader = { ...this.isPreloader, submit: true };
    const preset = this.prepareDataForSubmit(this.preset);
    const res = await this.savePreset(preset, this.siteId);
    this.isPreloader = { ...this.isPreloader, submit: false };
    if (res && res['error']) {
      console.warn('Oops, failed to save preset or start scanning', res['error']);
      return;
    } else {
      await this.closeModal();
    }
  }

  /**
   * Method for prepare data in desired form before submit
   *
   * @param model - scan option preset
   */
  prepareDataForSubmit(model: ScanOption): Omit<ScanOption, 'id'> {
    const preset: ScanOption = {
      ...model,
      checkMask: this.useCheckMask ? filterEmptyString(model.checkMask) : [],
      excludeMask: this.useExcludeMask ? filterEmptyString(model.excludeMask) : [],
    };

    delete preset.id;
    delete preset.docroot;
    return preset;
  }

  render() {
    return (
      <Host>
        <slot name="title" />

        <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'CHECK_FOLDER'])}</span>

        <div class="flex-container form-label">
          <span style={{ 'margin-right': '10px' }}>{this.preset.docroot}/</span>
          <antivirus-card-input
            width="310px"
            value={this.preset.path[0]}
            onChanged={e => {
              this.handleChangePath(e.detail);
              e.stopPropagation();
            }}
          ></antivirus-card-input>
        </div>

        {/** @todo rewrite and use CheckInput component  */}
        <CheckByMask
          msg={this.t.msg(['SCAN_SETTINGS', 'USE_MASK_FOR_CHECK_FILES'])}
          isActive={this.useCheckMask}
          values={this.preset.checkMask}
          handleChangeCheckbox={(checked: boolean) => (this.useCheckMask = checked)}
          handleChangeInput={this.handleChangeCheckMask.bind(this)}
        >
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CHECK_MASK_HINT'])}</antivirus-card-hint>
        </CheckByMask>

        {/** @todo rewrite and use CheckInput component  */}
        <CheckByMask
          msg={this.t.msg(['SCAN_SETTINGS', 'USE_MASK_FOR_IGNORE_FILES'])}
          isActive={this.useExcludeMask}
          values={this.preset.excludeMask}
          handleChangeCheckbox={(checked: boolean) => (this.useExcludeMask = checked)}
          handleChangeInput={this.handleChangeExcludeMask.bind(this)}
        >
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CHECK_MASK_HINT'])}</antivirus-card-hint>
        </CheckByMask>

        {/* <div class="flex-container form-label" style={{ 'margin-top': '15px' }}>
          <span>{this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', 'TEXT'])}</span>
          <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', 'HINT_TEXT'])}</antivirus-card-hint>
        </div>

        <antivirus-card-switcher>
          {['LOW', 'MEDIUM', 'HIGH'].map((type: IntensityType) => (
            <antivirus-card-switcher-option active={this.preset.intensity === type} onClick={() => this.handleChangeIntensity(type)}>
              {this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', type])}
            </antivirus-card-switcher-option>
          ))}
        </antivirus-card-switcher> */}

        <div style={{ 'margin-top': '30px' }} class="flex-container">
          <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <antivirus-card-button onClick={async () => await this.handleScan()}>
              {this.t.msg(['SCAN_SETTINGS', 'BUTTON_SCAN'])}
            </antivirus-card-button>
          </antivirus-card-preloader>
          {/* <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <a class="link link_indent-left" onClick={async () => await this.handleSave()}>
              {this.t.msg(['SCAN_SETTINGS', 'BUTTON_SAVE'])}
            </a>
          </antivirus-card-preloader> */}
          <a
            class="link link_indent-left"
            onClick={() => {
              this.closeModal();
            }}
          >
            {this.t.msg(['SCAN_SETTINGS', 'BUTTON_CANCEL'])}
          </a>
        </div>
      </Host>
    );
  }
}
