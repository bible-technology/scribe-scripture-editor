'use client';

import PropTypes from 'prop-types';
import SubMenuBar from '@/layouts/editor/SubMenuBar';
import MenuBar from '@/layouts/editor/WebMenuBar';

export default function EditorLayout(props) {
  const { children } = props;

  return (
    <>
      <MenuBar />
      <SubMenuBar />

      <main className="bg-gray-50-x">{children}</main>
    </>
  );
}

EditorLayout.propTypes = {
  children: PropTypes.any,
};
