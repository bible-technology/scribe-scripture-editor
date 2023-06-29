import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import PopupButton from './PopupButton';
import PlusIcon from '@/icons/Xelah/Plus.svg';

export default function InsertMenu({ handleClick: handleButtonClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = (number, title) => {
    handleButtonClick(number, title);
    setIsOpen(false);
  }
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          onClick={() => setIsOpen(!isOpen)}
        // className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon
            aria-label="Insert-Icon"
            className="h-6 mr-2 w-6 text-white cursor-pointer"
            aria-hidden="true"
            title="Insert"
          />
        </Menu.Button>
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            static
            className="fixed top-[193px] right-5 min-w-[183px] z-50 bg-white shadow-lg rounded-md"
          >
            <Menu.Item>
              <PopupButton handleClick={handleClick} title="Verse" roundedHover="hover:rounded-t-md" />
            </Menu.Item>
            <Menu.Item>
              <PopupButton handleClick={handleClick} title="Chapter" />
            </Menu.Item>
            <Menu.Item>
              <PopupButton handleClick={handleClick} title="Footnote" />
            </Menu.Item>
            <Menu.Item>
              <PopupButton handleClick={handleClick} title="Cross Reference" roundedHover="hover:rounded-b-md" />
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
