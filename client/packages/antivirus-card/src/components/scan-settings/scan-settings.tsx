import { Component, h, Host, State, Prop } from '@stencil/core';
import { ITranslate } from '../../models/translate.reducers';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Store } from '@stencil/redux';
import { ScanOption } from '../../models/antivirus/state';
import { AntivirusActions } from '../../models/antivirus/actions';

/**
 * Scan settings component
 */
@Component({
  tag: 'antivirus-card-scan-settings',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class ScanSettings {
  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  @Prop() closeModal: () => void = () => {};

  /** Model settings for new scan */
  @Prop({ mutable: true }) preset!: ScanOption;

  /** Translate object */
  @State() t: ITranslate;

  /** State for preloader */
  @State() isPreloader: {
    submit: boolean;
  } = { submit: false };

  /** Method to update global state */
  savePreset: typeof AntivirusActions.savePreset;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate }));
    this.store.mapDispatchToProps(this, {
      savePreset: AntivirusActions.savePreset,
    });
  }

  /**
   * Handle for use click scan button
   */
  handleScan() {
    /** @TODO add fetch query for this handle */
    this.isPreloader = { ...this.isPreloader, submit: true };
    const model = this._prepareDataForSubmit(this.preset);
    console.log(model);
    this.isPreloader = { ...this.isPreloader, submit: false };
  }

  /**
   * Handle for use click save button
   */
  async handleSave() {
    this.isPreloader = { ...this.isPreloader, submit: true };
    const preset = this._prepareDataForSubmit(this.preset);
    const presetId = await this.savePreset(preset);
    console.log(presetId);
    this.isPreloader = { ...this.isPreloader, submit: false };
    this.closeModal();
  }
  /**
   * Method for prepare data in desired form before submit
   */
  private _prepareDataForSubmit(model: ScanOption): Omit<ScanOption, 'id'> {
    const preset: ScanOption = {
      ...model,
    };

    return preset;
  }

  render() {
    return (
      <Host>
        <slot name="title" />

        <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'CHECK_FOLDER'])}</span>

        {/* <antivirus-card-switcher>
          {['low', 'medium', 'high'].map((type: IntensityType) => (
            <antivirus-card-switcher-option active={this.preset.intensity === type} onClick={() => {}}>
              {this.t.msg(['SCAN_SETTINGS', 'INSPECTION_INTENSITY', type])}
            </antivirus-card-switcher-option>
          ))}
        </antivirus-card-switcher> */}

        <div style={{ 'margin-top': '30px' }} class="flex-container">
          <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <antivirus-card-button onClick={() => this.handleScan()}>{this.t.msg(['SCAN_SETTINGS', 'BUTTON_SCAN'])}</antivirus-card-button>
          </antivirus-card-preloader>
          <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
            <a class="link link_indent-left" onClick={() => this.handleSave()}>
              {this.t.msg(['SCAN_SETTINGS', 'BUTTON_SAVE'])}
            </a>
          </antivirus-card-preloader>
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
