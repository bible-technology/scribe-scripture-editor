import React from 'react';
import Home from './pages/Home';
import { Layout } from './components/Layout';
// import JuxtAlignEditor from '../JuxtAlignEditor';

const JuxtalinearEditor: React.FC<any> = ({ juxtaMode }) => {
  return (
    <Layout>
      {/* {juxtaMode === true */}
      <Home />
      {/* // : (<JuxtAlignEditor />)} */}
    </Layout>
  );
};

export default JuxtalinearEditor;
