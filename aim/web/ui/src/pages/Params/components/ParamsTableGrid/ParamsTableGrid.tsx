import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Link } from '@material-ui/core';
import { merge } from 'lodash-es';

import TagLabel from 'components/TagLabel/TagLabel';
import COLORS from 'config/colors/colors';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { PathEnum } from 'config/enums/routesEnum';
import Icon from 'components/Icon/Icon';
import TableSortIcons from 'components/Table/TableSortIcons';
import { SortField } from 'types/services/models/metrics/metricsAppModel';
import Button from 'components/Button/Button';

function getParamsTableColumns(
  metricsColumns: any,
  paramColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  sortFields?: any[],
  onSort?: (field: string, value?: 'asc' | 'desc' | 'none') => void,
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('experiment')
        ? 'left'
        : order?.middle?.includes('experiment')
        ? null
        : order?.right?.includes('experiment')
        ? 'right'
        : 'left',
    },
    {
      key: 'run',
      content: <span>Run</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.right?.includes('run')
        ? 'right'
        : null,
    },
    {
      key: 'actions',
      content: '',
      topHeader: '',
      pin: 'right',
    },
  ].concat(
    Object.keys(metricsColumns).reduce((acc: any, key: string) => {
      acc = [
        ...acc,
        ...Object.keys(metricsColumns[key]).map((metricContext) => ({
          key: `${key}_${metricContext}`,
          content: (
            <TagLabel
              size='small'
              color={COLORS[0][0]}
              label={metricContext === '' ? 'No context' : metricContext}
            />
          ),
          topHeader: key,
          pin: order?.left?.includes(`${key}_${metricContext}`)
            ? 'left'
            : order?.right?.includes(`${key}_${metricContext}`)
            ? 'right'
            : null,
        })),
      ];
      return acc;
    }, []),
    paramColumns.map((param) => {
      const sortItem: SortField = sortFields?.find(
        (value) => value[0] === `run.params.${param}`,
      );

      return {
        key: param,
        content: (
          <span>
            {param}
            {onSort && (
              <TableSortIcons
                onSort={() => onSort(`run.params.${param}`)}
                sortFields={sortFields}
                sort={Array.isArray(sortItem) ? sortItem[1] : null}
              />
            )}
          </span>
        ),
        topHeader: 'Params',
        pin: order?.left?.includes(param)
          ? 'left'
          : order?.right?.includes(param)
          ? 'right'
          : null,
      };
    }),
  );

  if (groupFields) {
    columns.push({
      key: '#',
      content: <span style={{ textAlign: 'right' }}>#</span>,
      topHeader: 'Grouping',
      pin: 'left',
    });
    Object.keys(groupFields).forEach((field) => {
      const key = field.replace('run.params.', '');
      const column = columns.find((col) => col.key === key);
      if (!!column) {
        column.pin = 'left';
        column.topHeader = 'Grouping';
      }
    });
  }

  columns = columns.map((col) => ({
    ...col,
    isHidden: hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === '#') {
      return -1;
    } else if (
      groupFields?.hasOwnProperty(a.key) ||
      groupFields?.hasOwnProperty(`run.params.${a.key}`)
    ) {
      return -1;
    } else if (a.key === 'actions') {
      return 1;
    }
    if (!columnsOrder.includes(a.key) && !columnsOrder.includes(b.key)) {
      return 0;
    } else if (!columnsOrder.includes(a.key)) {
      return 1;
    } else if (!columnsOrder.includes(b.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });
  return columns;
}

function paramsTableRowRenderer(
  rowData: any,
  actions?: { [key: string]: (e: any) => void },
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (Array.isArray(rowData[col])) {
        row[col] = {
          content: (
            <TagLabel
              size='small'
              color={COLORS[0][0]}
              label={`${rowData[col].length} values`}
            />
          ),
        };
      }
    }

    return merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData.experiment,
      run: {
        content: (
          <Link
            to={PathEnum.Run_Detail.replace(':runHash', rowData.runHash)}
            component={RouteLink}
          >
            {rowData.run}
          </Link>
        ),
      },
      actions: {
        content: (
          <Button
            withOnlyIcon={true}
            size='small'
            onClick={actions?.toggleVisibility}
            className='Table__action__icon'
            aria-pressed='false'
          >
            <Icon
              name={rowData.isHidden ? 'eye-outline-hide' : 'eye-show-outline'}
            />
          </Button>
        ),
      },
    };

    return merge({}, rowData, row);
  }
}

export { getParamsTableColumns, paramsTableRowRenderer };