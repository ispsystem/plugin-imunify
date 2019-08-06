import { Component, h, Host, State, Prop, Method, Element } from '@stencil/core';
import { ITranslate } from '../../models/translate.reducers';
import { RootState, Notifier } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Store } from '@stencil/redux';
import { ScanOption, CheckFileType } from '../../models/antivirus/state';
import { AntivirusActions } from '../../models/antivirus/actions';
import { CheckInput } from '../check-input/check-input';

/** Types for max time scan result */
export type MaxScanResultType = 'ITEM_1' | 'ITEM_3' | 'ITEM_6' | 'ITEM_12' | 'ITEM_24' | 'ITEM_0';

/** Types for log details */
export type LogDetailsType = 'FULL' | 'COMMON';

/**
 * Scan settings component
 */
@Component({
  tag: 'antivirus-card-scan-settings',
  styleUrls: ['styles/$.scss', '../style.scss'],
  shadow: true,
})
export class ScanSettings {
  /** Host element */
  @Element() host: HTMLAntivirusCardScanSettingsElement;

  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** global notifier object */
  @State() notifier: Notifier;

  /** Method for click close modal */
  @Prop() closeModal: () => void = () => {};

  /** Model settings for new scan */
  @State() preset: ScanOption;

  /** Translate object */
  @State() t: ITranslate;

  /** Site id state */
  @State() siteId: RootState['siteId'];

  /** Flag for use email notification */
  @State() useEmailNotify: boolean;

  /** State for preloader */
  @State() isPreloader: {
    submit: boolean;
  } = { submit: false };

  /** Method to update global state */
  savePreset: typeof AntivirusActions.savePreset;

  /** Action scan */
  saveAndScan: typeof AntivirusActions.saveAndScan;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({
      ...state.antivirus,
      t: state.translate,
      notifier: state.notifier,
      siteId: state.siteId,
    }));
    this.store.mapDispatchToProps(this, {
      savePreset: AntivirusActions.savePreset,
      saveAndScan: AntivirusActions.saveAndScan,
    });
  }

  /**
   * Method for set preset in modal
   *
   * @param preset - model of scanOptions
   */
  @Method()
  async setPreset(preset: ScanOption) {
    /** @todo @bug modal state is not update when preset update */
    // this.host.forceUpdate();
    this.preset = { ...preset };
    this.useEmailNotify = this.preset.email !== '';
  }

  /**
   * Handle for change count of day field
   *
   * @param saveCopyFilesDay - new value
   */
  handleChangeDayCount(saveCopyFilesDay: string) {
    this.preset = {
      ...this.preset,
      saveCopyFilesDay: parseInt(saveCopyFilesDay) !== null ? parseInt(saveCopyFilesDay) : 0,
    };
  }

  /**
   * Handle for change flag of curing files
   *
   * @param cureFoundFiles - new value
   */
  handleChangeCureFiles(cureFoundFiles: boolean) {
    this.preset = {
      ...this.preset,
      cureFoundFiles,
    };
  }

  /**
   * Handle for change flag of remove only content of files
   *
   * @param removeInfectedFileContent - new value
   */
  handleChangeRemoveFileContent(removeInfectedFileContent: boolean) {
    this.preset = {
      ...this.preset,
      removeInfectedFileContent,
    };
  }

  /**
   * Handle for change flag of auto update
   *
   * @param autoUpdate - new value
   */
  handleChangeAutoUpdate(autoUpdate: boolean) {
    this.preset = {
      ...this.preset,
      autoUpdate,
    };
  }

  /**
   * Handle for change user email field
   *
   * @param email - new value
   */
  handleChangeEmail(email: string) {
    this.preset = {
      ...this.preset,
      email,
    };
  }

  /**
   * Handle for change count of ram for check
   *
   * @param ramForCheck - new value
   */
  handleRamForCheckChange(ramForCheck: number) {
    this.preset = {
      ...this.preset,
      ramForCheck,
    };
  }

  /**
   * Handle for change count of parallel checks
   *
   * @param parallelChecks - new value
   */
  handleParallelChecksChange(parallelChecks: number) {
    this.preset = {
      ...this.preset,
      parallelChecks,
    };
  }

  /**
   * Handle for change max scan time
   *
   * @param maxScanTime - new value
   */
  handleMaxScanTimeChange(maxScanTime: number) {
    this.preset = {
      ...this.preset,
      maxScanTime,
    };
  }

  /**
   * Handle for click scan button
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
      this.closeModal();
    }
  }

  /**
   * Handle for click save button
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
      this.closeModal();
    }
  }

  /**
   * Method for prepare data in desired form before submit
   */
  prepareDataForSubmit(model: ScanOption): Omit<ScanOption, 'id'> {
    const preset: ScanOption = { ...model };

    delete preset.id;
    delete preset.docroot;

    return preset;
  }

  render() {
    return (
      this.preset && (
        <Host>
          <span class="title">{this.t.msg(['SCAN_SETTINGS', 'CONFIGURE_SCAN'])}</span>

          <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'CHECK_FILE_TYPE', 'TEXT'])}</span>

          <div class="flex-container">
            <antivirus-card-switcher>
              {/** @todo change to upperCase when backend realise it */}
              {['critical', 'all', 'except_media'].map((type: CheckFileType) => (
                <antivirus-card-switcher-option
                  active={this.preset.checkFileTypes === type}
                  onClick={() => (this.preset = { ...this.preset, checkFileTypes: type })}
                >
                  {this.t.msg(['SCAN_SETTINGS', 'CHECK_FILE_TYPE', type])}
                </antivirus-card-switcher-option>
              ))}
            </antivirus-card-switcher>
            <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CHECK_FILE_TYPE', 'HINT_TEXT'])}</antivirus-card-hint>
          </div>

          <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'SAVE_COPY_FILES'])}</span>
          <div class="flex-container">
            <antivirus-card-input
              width="80px"
              type="number"
              value={this.preset.saveCopyFilesDay.toString()}
              onChanged={event => {
                this.handleChangeDayCount(event.detail);
                event.stopPropagation();
              }}
            ></antivirus-card-input>
            <span style={{ 'margin-left': '10px' }}>{this.t.msg(['SCAN_SETTINGS', 'DAY_COUNT'], this.preset.saveCopyFilesDay)}</span>
          </div>

          <antivirus-card-checkbox
            class="form-label"
            checked={this.preset.cureFoundFiles}
            onChanged={event => {
              this.handleChangeCureFiles(event.detail);
              event.stopPropagation();
            }}
          >
            {this.t.msg(['SCAN_SETTINGS', 'AUTO_HEAL_MALWARE'])}
          </antivirus-card-checkbox>

          <antivirus-card-checkbox
            class="form-label"
            checked={this.preset.removeInfectedFileContent}
            onChanged={event => {
              this.handleChangeRemoveFileContent(event.detail);
              event.stopPropagation();
            }}
          >
            {this.t.msg(['SCAN_SETTINGS', 'DELETE_ONLY_CONTENT'])}
          </antivirus-card-checkbox>

          <CheckInput
            isActive={this.useEmailNotify}
            msg={this.t.msg(['SCAN_SETTINGS', 'EMAIL_NOTIFY'])}
            value={this.preset.email}
            inputWrapperClass="flex-container"
            handleChangeCheckbox={(checked: boolean) => (this.useEmailNotify = checked)}
            handleChangeInput={this.handleChangeEmail.bind(this)}
          />

          <antivirus-card-collapse
            isOpen={false}
            style={{ 'margin-top': '15px' }}
            text={{
              open: this.t.msg(['SCAN_SETTINGS', 'HIDE_ADVANCED_SETTINGS']),
              close: this.t.msg(['SCAN_SETTINGS', 'ADVANCED_SETTINGS']),
            }}
          >
            <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'CPU_THREAD_COUNT', 'TEXT'])}</span>
            <div class="flex-container">
              <antivirus-card-select
                onChanged={e => {
                  this.handleParallelChecksChange(e.detail);
                  e.stopPropagation;
                }}
                width={70}
              >
                {[1, 2, 4].map(value => (
                  <antivirus-card-select-option selected={this.preset.parallelChecks === value} value={value}>
                    {value}
                  </antivirus-card-select-option>
                ))}
              </antivirus-card-select>
              <antivirus-card-hint>{this.t.msg(['SCAN_SETTINGS', 'CPU_THREAD_COUNT', 'HINT_TEXT'])}</antivirus-card-hint>
            </div>

            <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'RAM_COUNT'])}</span>
            <div class="flex-container">
              <antivirus-card-select
                onChanged={e => {
                  this.handleRamForCheckChange(e.detail);
                  e.stopPropagation;
                }}
                width={100}
              >
                {[256, 384, 512, 1024].map(value => (
                  <antivirus-card-select-option selected={this.preset.ramForCheck === value} value={value}>
                    {value}
                  </antivirus-card-select-option>
                ))}
              </antivirus-card-select>
              <span style={{ 'margin-left': '10px' }}>MB</span>
            </div>

            <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'DETAIL_LOG', 'TEXT'])}</span>
            <div class="flex-container">
              <antivirus-card-switcher>
                {['COMMON', 'FULL'].map((type: LogDetailsType) => (
                  <antivirus-card-switcher-option
                    active={this.preset.fullLogDetails && type === 'FULL'}
                    onClick={() => (this.preset = { ...this.preset, fullLogDetails: type === 'FULL' })}
                  >
                    {this.t.msg(['SCAN_SETTINGS', 'DETAIL_LOG', type])}
                  </antivirus-card-switcher-option>
                ))}
              </antivirus-card-switcher>
            </div>

            <span class="form-label">{this.t.msg(['SCAN_SETTINGS', 'MAX_SCAN_TIME', 'TEXT'])}</span>
            <div class="flex-container">
              <antivirus-card-select
                onChanged={e => {
                  this.handleMaxScanTimeChange(e.detail);
                  e.stopPropagation;
                }}
                width={200}
              >
                {[1, 3, 6, 12, 24, 0].map(value => (
                  <antivirus-card-select-option selected={this.preset.maxScanTime === value} value={value}>
                    {this.t.msg(['SCAN_SETTINGS', 'MAX_SCAN_TIME', `ITEM_${value.toString()}` as MaxScanResultType])}
                  </antivirus-card-select-option>
                ))}
              </antivirus-card-select>
            </div>

            <antivirus-card-checkbox
              class="form-label"
              checked={this.preset.autoUpdate}
              onChanged={event => {
                this.handleChangeAutoUpdate(event.detail);
                event.stopPropagation();
              }}
            >
              {this.t.msg(['SCAN_SETTINGS', 'AUTO_UPDATE_DB'])}
            </antivirus-card-checkbox>
          </antivirus-card-collapse>

          <div style={{ 'margin-top': '30px' }} class="flex-container">
            <antivirus-card-preloader type="overlay" loading={this.isPreloader.submit}>
              <antivirus-card-button onClick={() => this.handleScan()}>
                {this.t.msg(['SCAN_SETTINGS', 'BUTTON_SCAN'])}
              </antivirus-card-button>
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
      )
    );
  }
}
