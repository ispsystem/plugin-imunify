import { Component, h, Host, Event, EventEmitter, State, Prop } from '@stencil/core';
import { AntivirusState } from '../../models/antivirus.reducers';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss'
})
export class ButtonComponent {
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() infectedFiles: AntivirusState['infectedFiles'];
  @Event() openBuyModal: EventEmitter;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus }));
  }

  render() {
    return (
      <Host>
        {(this.infectedFiles && this.infectedFiles.length) > 0 ? (
          <div style={{ display: 'contents' }}>
            <p class="stub-text">
              Сейчас всё хорошо, заражённых файлов нет. В случае появления вирусов, информация о них будет храниться в этой вкладке. Для
              лечения вирусов вам понадобится Imunify Pro. Оформить подписку можно сейчас.
            </p>

            <antivirus-card-button onClick={() => this.openBuyModal.emit()} btn-theme="accent">
              Оформить подписку на Imunify Pro
            </antivirus-card-button>
          </div>
        ) : (
          this.renderInfectedFilesTable()
        )}
      </Host>
    );
  }

  renderInfectedFilesTable = () => {
    return (
      <antivirus-card-table>
        <div slot="table-header" style={{ display: 'contents' }}>
          <antivirus-card-table-row style={{ height: '50px', 'vertical-align': 'middle' }}>
            <antivirus-card-table-cell style={{ width: 250 - 40 + 'px' }}>Имя файла</antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 130 - 20 + 'px' }}>Название угрозы</antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 130 - 20 + 'px' }}>Обнаружен</antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 370 - 20 + 'px' }}>Расположение файла</antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        <div slot="table-body" style={{ display: 'contents' }}>
          <antivirus-card-table-row action-hover>
            <antivirus-card-table-cell doubleline>
              <span class="main-text">beregovoi_orcestr.bat</span>
              <span class="add-text">заражён</span>
            </antivirus-card-table-cell>
            <antivirus-card-table-cell doubleline>
              <span class="isp-table-cell__main-text">Troyan.enspect</span>
            </antivirus-card-table-cell>
            <antivirus-card-table-cell doubleline>
              <span class="isp-table-cell__main-text">27.05.2018</span>
            </antivirus-card-table-cell>
            <antivirus-card-table-cell doubleline>
              <span class="main-text">sanin/save</span>
              <span class="add-text">изменён 29.05.2019 в 9:15</span>
            </antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        {/* <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>1 запись</span>
            <antivirus-card-table-pagination />
          </div>
        </div> */}
      </antivirus-card-table>
    );
  };
}
