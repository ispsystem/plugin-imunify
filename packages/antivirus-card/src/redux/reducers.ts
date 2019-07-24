import { combineReducers } from 'redux';
import { Observable } from 'rxjs';

import { AntivirusState, antivirusReducer } from '../models/antivirus.reducers';
import { translateReducer, ITranslate } from '../models/translate.reducers';

/** @todo: move to common plugin lib */
export interface INotifier {
  ids: (ids$: number[] | Observable<number[]>) => INotifier;
  create$: () => Observable<any>;
  delete$: () => Observable<any>;
  taskList$: () => Observable<any>;
}

/** @todo: move to common plugin lib */
export interface ISPNotifierEvent {
  entity: string; // название сущности
  id: number; // id сущности
  path: string; // путь до сущности (например host/1/image/1 или host/1)
  type: 'create' | 'update' | 'delete'; // тип нотификации
  relations: {
    [entity: string]: number; // объект, где ключ - название сущности, значение - id (формируется из поля `path`)
  };
  data?: any; // данные полученные из хендлера для типа, если он был указан
  // если нотификация по задаче (сущность 'task')
  additional_data?: {
    id?: number; // id задачи
    name: string; // название задачи
    status: 'created' | 'deferred' | 'running' | 'failed' | 'complete'; // статус задачи
    // прогресс задачи, такой формат вроде как формализован на BE но может быть что угодно
    progress?:
      | {
          state?: string; // состояние
          params?: {
            [key: string]: any;
          } | null; // параметры
        }
      | any;
    deferred_reason?: string; // причина, по которой задача отложена (если статус deferred)
  };
}

// This interface represents app state by nesting feature states.
export interface RootState {
  antivirus: AntivirusState;
  notifier: INotifier;
  translate: ITranslate;
}

// Combine feature reducers into a single root reducer
export const rootReducer = combineReducers({
  antivirus: antivirusReducer,
  notifier: (state: INotifier = null) => state,
  translate: translateReducer
});
