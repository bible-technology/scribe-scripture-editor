import React from 'react';
import PropTypes from 'prop-types';
import {
  TableSortLabel,
  TableCell,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const headCells = [
  {
    id: 'name', numeric: false, disablePadding: true, label: 'label-project-name',
  },
  {
    id: 'language', numeric: false, disablePadding: true, label: 'label-language',
  },
  {
    id: 'type', numeric: false, disablePadding: true, label: 'label-flavor',
  },
  {
    id: 'date', numeric: true, disablePadding: false, label: 'label-created-date',
  },
  {
    id: 'view', numeric: true, disablePadding: false, label: 'label-last-viewed',
  },
];

function EnhancedTableHead(props) {
  const {
    order, orderBy, onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          scope="col"
          className="sticky top-0 z-10 bg-gray-50"
        />

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            className="sticky top-0 z-10 bg-gray-50"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <div className="flex content-center">
              <TableSortLabel
                scope="col"
                id="sorthead"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ fontWeight: 'bold', color: 'grey' }}
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {/* {headCell.label} */}
                {t(headCell.label)}
                {orderBy === headCell.id ? (
                  <span hidden aria-live="assertive">
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}

              </TableSortLabel>

            </div>
          </TableCell>
        ))}

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-medium text-gray-400 sticky top-0 z-10 bg-gray-50"
        >
          {/* <ExternalLinkIcon className="h-5 w-5" aria-hidden="true" /> */}
        </th>
      </tr>
    </thead>
  );
}

export default EnhancedTableHead;

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};
