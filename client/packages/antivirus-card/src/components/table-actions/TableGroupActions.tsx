import { FunctionalComponent, h } from '@stencil/core';
import { DoneIcon } from '../icons/doneIcon';
import { ITranslate } from '../../models/translate.reducers';

/**
 * Table group action component
 */
interface TableGroupActionsProps {
  selectedCount: number;
  action: {
    name: string;
    msg: string;
  }[];
  t: ITranslate;
  handleActions: (x: string) => Promise<void>;
}

/**
 * Render checkbox with input from check mask field
 *
 * @param props - properties
 */
export const TableGroupActions: FunctionalComponent<TableGroupActionsProps> = props => {
  return (
    props.selectedCount > 0 && (
      <div>
        <DoneIcon />
        <span style={{ margin: '0 10px' }}>{props.t.msg(['TABLE', 'SELECTED_COUNT'], { count: props.selectedCount })}</span>
        {props.action.map(action => (
          <a class="link link-dashed" style={{ 'margin-right': '10px' }} onClick={async () => await props.handleActions(action.name)}>
            {action.msg}
          </a>
        ))}
      </div>
    )
  );
};
