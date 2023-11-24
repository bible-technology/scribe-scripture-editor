import { Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  Popover, Transition,
} from '@headlessui/react';

export default function PopoverProjectType(props) {
  const {
    children,
    items,
    handleDropDown,
  } = props;

  return (
    <Popover className="relative">
      {() => (
        <>
          {/* <Popover.Button as={Fragment}>
            {children}
          </Popover.Button> */}
          <Popover.Button>
            {children}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 w-screen max-w-xs mt-3 left-0 sm:px-0">
              {({ close }) => (
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid gap-0 bg-black p-4 grid-cols-2">
                    {items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        data-id={item.name}
                        onClick={() => { handleDropDown(item.name); close(); }}
                        className="flex text-white hover:text-primary items-center justify-center flex-col py-3 transition duration-150 ease-in-out rounded-lg hover:bg-white focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                      >

                        <item.icon
                          fill="currentColor"
                          className="w-6 h-6 "
                          aria-hidden="true"
                        />

                        <p className="mt-3 text-sm tracking-wider">
                          {item.name === 'Translation' ? `Bible ${item.name}` : item.name}
                        </p>

                      </a>
                  ))}
                  </div>

                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

PopoverProjectType.propTypes = {
  children: PropTypes.any,
  items: PropTypes.array,
  handleDropDown: PropTypes.func,
};
