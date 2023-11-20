import React from 'react';
import PropTypes from 'prop-types';
import {
  TableSortLabel,
  TableCell,
} from '@material-ui/core';
// import {
//   StarIcon,
// } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
// import i18n from '../../../translations/i18n';

// import { Menu, Transition } from '@headlessui/react';

const headCells = [
  {
    // id: 'name', numeric: false, disablePadding: true, label: 'Project Name',
    id: 'name', numeric: false, disablePadding: true, label: 'label-project-name',
    // id: 'name', numeric: false, disablePadding: true, label: i18n.t('label-project-name'),
  },
  {
    id: 'language', numeric: false, disablePadding: true, label: 'label-language',
  },
  {
    // id: 'type', numeric: false, disablePadding: true, label: 'Flavor',
    id: 'type', numeric: false, disablePadding: true, label: 'label-flavour',
  },
  {
    id: 'date', numeric: true, disablePadding: false, label: 'label-created-date',
  },
  {
    id: 'view', numeric: true, disablePadding: false, label: 'label-last-viewed',
  },
  // {
  //   id: 'editors', numeric: false, disablePadding: false, label: 'Editors',
  // },
  // {
  //   id: 'more', numeric: false, disablePadding: false, label: '',
  // },
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
            // colSpan="2"
          // className="px-4 py-3 text-left text-xs font-medium text-gray-400"
        >
          {/* <StarIcon className="h-5 w-5" aria-hidden="true" /> */}
        </th>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            className="bg-gray-50"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <div className="flex content-center">
              {/* <Menu as="div" className="relative inline-block mr-2 mt-2">
                  <Menu.Button className="focus:outline-none">
                    <FilterIcon
                      className="w-4 h-4 text-gray-400 hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white
                    divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black
                    ring-opacity-5 focus:outline-none"
                    >
                      <div className="px-3 py-2 bg-gray-100 flex justify-between uppercase text-xs text-gray-500">
                        Filters
                      </div>
                      <div className="px-1 py-1 ">
                        <Menu.Item>
                          {({ active }) => (
                            <div className={`${active ? 'bg-primary text-white' : 'text-gray-600'
                              } group flex items-center rounded-md w-full px-2 py-2 text-sm`}
                            >
                              <input
                                type="checkbox"
                                className={`${active ? 'border-black' : 'border-gray-300'}
                                mr-2 form-tick appearance-none h-4
                              w-4 border  rounded-md checked:bg-primary
                              checked:border-transparent focus:outline-none`}
                              />
                              Active
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div className={`${active ? 'bg-primary text-white' : 'text-gray-600'
                              } group flex items-center rounded-md w-full px-2 py-2 text-sm`}
                            >
                              <input
                                type="checkbox"
                                className={`${active ? 'border-black' : 'border-gray-300'}
                                mr-2 form-tick appearance-none h-4
                              w-4 border  rounded-md checked:bg-primary
                              checked:border-transparent focus:outline-none`}
                              />
                              Finished
                            </div>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="px-3 py-2 bg-gray-100 flex justify-between">

                        <Menu.Item>
                          <button
                            type="button"
                            className="px-3 py-1 rounded btn-xs bg-white border border-gray-400 hover:border-gray-400 text-gray-500 hover:text-gray-600"
                          >
                            Clear
                          </button>
                        </Menu.Item>

                        <Menu.Item>
                          <button
                            type="button"
                            className="px-3 py-1 rounded btn-xs bg-primary border border-gray-400 hover:border-gray-400 text-white hover:text-gray-600"
                          >
                            Apply
                          </button>
                        </Menu.Item>

                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu> */}

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
                  <span hidden>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                  ) : null}

              </TableSortLabel>

            </div>
          </TableCell>
          ))}

        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-medium text-gray-400"
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
