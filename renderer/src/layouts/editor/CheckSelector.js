import React, { useContext, useState, useEffect } from "react";
import packageInfo from '../../../../package.json';
import AdjustmentsVerticalIcon from '@/icons/Common/AdjustmentsVertical.svg';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import localForage from 'localforage';
import * as logger from '../../logger';
import { convertUsfmToUsj } from '@/components/EditorPage/TextEditor/conversionUtils.js';
// const { Worker } = require('worker_threads');

const CheckSelector = ({
  showResourcesPanel,
  recipe,
  setRecipe,
  bookId,
  referenceResources,
  setReferenceSourceData,
  openResourcePopUp
}) => {

  const [theProjectNameClean, setTheProjectNameClean] = useState('');
  const [firstSelection, setFirstSelection] = useState(true);

  // function runConversionInWebWorker(dataSrcBook, pathInstance) {
  //   return new Promise((resolve, reject) => {

  //     const workerPath = pathInstance.resolve(__dirname, 'usfmWorker.js');
  //     console.log("workerPath",workerPath);
  //     const workerUrl = `file://${workerPath}`;
  //     const worker = new Worker(workerUrl);
  //     worker.postMessage(dataSrcBook);
  
  //     worker.onmessage = (event) => {
  //       if (event.data.success) {
  //         resolve(event.data.result);
  //       } else {
  //         reject(new Error(event.data.error));
  //       }
  //     };
  
  //     worker.onerror = (error) => {
  //       reject(error);
  //     };
  //   });
  // }

  useEffect(() => {
    let dataSrcBook = null;

    localForage.getItem('userProfile').then(async (user) => {
      logger.debug('CheckSelector.js', 'reading offline helps ', referenceResources);

      const fs = window.require('fs');
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      const currentUser = user?.username;
      const folder = path.join(newpath, packageInfo.name, 'users', `${currentUser}`, 'resources');
      const projectName = `${referenceResources.refName}`;
      setTheProjectNameClean(projectName.split('_').slice(0,-1).join('_'));
      const normalizedPath = path.join(folder, projectName);
      const metaPath = path.join(normalizedPath, 'metadata.json');

      const metaData = JSON.parse(await readRefBurrito({ metaPath }));
      const _books = [];

      Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
        if (_ingredients.scope) {
          const _bookID = Object.entries(_ingredients.scope)[0][0];
          const bookObj = { bookId: _bookID, fileName: key };
          _books.push(bookObj);
        }
      });

      const [currentBook] = _books.filter((bookObj) => bookObj.bookId === bookId?.toUpperCase());

      const pathCurrentBook = path.join(normalizedPath, currentBook.fileName);

      if (pathCurrentBook && fs.existsSync(pathCurrentBook)) {
        dataSrcBook = fs.readFileSync(pathCurrentBook, "utf8");
      }

      let trg_usfm_bookId = localStorage.getItem('trg_usfm_bookId');
      let refName = localStorage.getItem('ref_name');
      if (!refName) {
        localStorage.setItem('ref_name', projectName);
        refName = projectName;
      }
      // return;

      if (firstSelection || projectName != refName || !trg_usfm_bookId || (dataSrcBook && trg_usfm_bookId.toUpperCase() !== currentBook.bookId)) {
        if (!openResourcePopUp) {
          convertUsfmToUsj(dataSrcBook)
            .then((usfmToUsj) => {
              const strUsj = JSON.stringify(usfmToUsj.usj);
              localStorage.setItem('trg_usj', strUsj);
              localStorage.setItem('trg_usfm_bookId', usfmToUsj.usj?.content[0]?.code);
              localStorage.setItem('ref_name', projectName);
              setReferenceSourceData(strUsj);
            })
            .catch((e) => console.error('Error while loading source file', e));
          setFirstSelection(false);
        }
      }
    }).catch((e) => console.error("Error while loading source file", e));
  }, [bookId, openResourcePopUp, referenceResources.refName]);

  const writeJSONToFile = (updatedRecipe) => {
    const fs = window.require('fs');
    const path = require('path');
    const generatedJSON = {
      name: "Scribe checks",
      description: "",
      checks: updatedRecipe,
    };

    const newpath = localStorage.getItem('userPath');
    const projectsPath = path.join(newpath, packageInfo.name, 'config_checks.json');

    try {
      fs.writeFileSync(projectsPath, JSON.stringify(generatedJSON, null, 2), "utf8");
    } catch (error) {
      console.error("Error writing file:", error);
    }
  };

  // TODO : modify this
  const handleCheckToggle = (checkName) => {
    const updatedRecipe = recipe.map((check) => {
      if (check.parameters) {
        check.parameters.short_threshold = 30;
      }
      if (check.name === checkName) {
        return { ...check, enabled: !check.enabled };
      }
      return check;
    });

    setRecipe(updatedRecipe);
    writeJSONToFile(updatedRecipe);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Source Resources Button */}
      <button
        onClick={showResourcesPanel}
        className="border-2 border-orange-500 bg-primary px-4 py-2 text-white text-sm rounded-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
      >
        <AdjustmentsVerticalIcon className="h-5 w-5" />
        <span>Source Resource</span>
      </button>

      {/* Dropdown for Checks */}
      <Menu as="div" className="relative">
        <Menu.Button className="border-2 border-gray-400 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 hover:border-gray-500 focus:outline-none focus:ring focus:ring-gray-400">
          Checks <ChevronDownIcon className="inline w-4 h-4" />
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
          <Menu.Items className="absolute left-0 mt-2 w-72 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="p-3">
              <h3 className="font-semibold text-gray-700 mb-2">Available Checks</h3>
              {recipe.map((check) => (
                <label
                  key={check.name}
                  className="flex items-center space-x-2 mb-2 hover:bg-gray-100 rounded-md p-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={check.enabled}
                    onChange={() => handleCheckToggle(check.name)}
                    className="rounded text-primary focus:ring-primary focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">{check.description}</span>
                </label>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <span> {theProjectNameClean != '' && theProjectNameClean != 'undefined' ? `Resource selected : ${theProjectNameClean}` : 'No resource selected'}</span>
    </div>
  );
};

export default CheckSelector;
