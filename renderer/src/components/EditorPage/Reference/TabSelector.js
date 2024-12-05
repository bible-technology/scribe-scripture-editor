import React from 'react';
import { Tab } from '@headlessui/react';
import PropTypes from 'prop-types';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TabSelector({ currentTab, setCurrentTab, tabData }) {
  return (
    <div className="w-full px-2 sm:px-0 pb-2">
      <Tab.Group manual defaultIndex={2} selectedIndex={currentTab} onChange={setCurrentTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
          {tabData.map((data) => (
            <Tab
              key={data.id}
              className={({ selected }) => classNames(
                'w-full rounded-lg py-1 text-sm font-medium leading-5',
                'ring-white/60 ring-offset-2 ring-offset-gray-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-primary/80 text-white shadow'
                  : 'text-[#4b5563] hover:bg-[#4b5563]/40 hover:text-white',
              )}
            >
              {data.title}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}

export default TabSelector;

TabSelector.propTypes = {
  currentTab: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  setCurrentTab: PropTypes.func,
  tabData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};
