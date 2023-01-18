import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
    Menu, Transition,
} from '@headlessui/react';
import styles from '@/layouts/editor/SubMenuBar.module.css';

const MenuBar = ({
    header,
    MenuItems,
    style,
}) => (
  <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button aria-label={header === 'File' ? 'select-menu-file' : 'select-menu-edit'} className={styles.dd}>
        {header}
      </Menu.Button>
    </div>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      // TODO Fix map keys. Error : Each child in a list should have a unique "key" prop.
      <Menu.Items style={style} className="flex absolute z-50 left-0 w-screen mt-2 -ml-2 origin-top-left bg-white divide-y divide-gray-100 shadow ring-1 ring-black ring-opacity-5 focus:outline-none">
        {MenuItems.map((item) => (
          <div key={item.itemname} aria-label={header !== 'File' ? 'section-header' : ''} className="flex px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                  item.renderElement ? (
                    <>
                      <span
                        className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        {item.icon && (
                        <span
                          className="w-5 h-5 mr-2"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        )}
                      </span>
                      <span>
                        {item.renderElement}
                      </span>
                    </>
                ) : (
                  <span>
                    <span>
                      <button
                        aria-label={item.itemname === 'Bookmarks' ? 'select-bookmarks' : ''}
                        onClick={item.callback}
                        type="button"
                        className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        {item.icon && (
                        <span
                          className="w-5 h-5 mr-2"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        )}
                        <span>
                          {item.itemname}
                        </span>
                      </button>
                    </span>
                  </span>
                )
            )}
            </Menu.Item>
          </div>
          ))}

        {/* <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >
                <PencilIcon
                  className="w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                Edit
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >
                <DuplicateIcon
                  className="w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                Duplicate
              </button>
            )}
          </Menu.Item>
        </div>
        <div className="flex px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >

                <ArchiveIcon
                  className="w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                Archive
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >
                <ExternalLinkIcon
                  className="w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                Move
              </button>
            )}
          </Menu.Item>
        </div>
        <div className="flex px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={`${active ? 'bg-black text-primary' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >
                <TrashIcon
                  className="w-5 h-5 mr-2 text-violet-400"
                  aria-hidden="true"
                />
                Delete
              </button>
            )}
          </Menu.Item>
        </div> */}
      </Menu.Items>
    </Transition>
  </Menu>
    );
export default MenuBar;

MenuBar.propTypes = {
    header: PropTypes.string,
    MenuItems: PropTypes.array,
    style: PropTypes.object,
};
