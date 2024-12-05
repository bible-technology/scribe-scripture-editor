import { Dialog, Tab, Transition } from '@headlessui/react';
import React, {
  Fragment, useContext, useEffect, useState,
} from 'react';
import * as localForage from 'localforage';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Restore } from '@mui/icons-material';
import LogoIcon from '@/icons/logo.svg';
import { createUser, handleLogin, writeToFile } from '../../core/Login/handleLogin';
import { isElectron } from '../../core/handleElectron';
import * as logger from '../../logger';
import { AuthenticationContext } from './AuthenticationContextProvider';

const LeftLogin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [text, setText] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const {
    action: { generateToken },
  } = useContext(AuthenticationContext);
  // eslint-disable-next-line no-unused-vars
  const [valid, setValid] = useState({
    username: false,
    password: false,
  });
  const [showArchived, setShowArchived] = useState(false);
  const [userNameError, setUserNameError] = useState(false);

  /* Checking if the users array is empty, if it is, it is getting the users from localForage and
  setting the users array to the users from localForage. */
  useEffect(() => {
    const checkUsers = async () => {
      if (users.length === 0) {
        const user = await localForage.getItem('users');
        if (user) {
          setUsers(user);
        }
      }
    };
    checkUsers();
  }, [users]);

  function closeModal() {
    setIsOpen(false);
    setShowArchived(false);
  }
  function openModal() {
    setIsOpen(true);
  }
  function closeAccountModal() {
    setOpen(false);
    setValues({});
  }
  function openAccountModal() {
    setOpen(true);
  }
  const handleChange = (event) => {
    setValues({ ...values, username: event.target.value });
    setUserNameError(false);
  };

  /**
   * If the username is not empty, set the username error to false. If the username is empty, set the
   * username error to true.
   * @param values - the values of the form
   * @returns The return value is a boolean.
   */
  const handleValidation = (values) => {
    let user;
    if (values.username) {
      user = true;
      setUserNameError(false);
      setNewOpen(false);
    } else if (values.username === '') {
      user = false;
      setUserNameError(true);
    } else {
      user = false;
      setUserNameError(true);
    }
    return user;
  };
  /* Sorting the users array by the lastSeen property. */
  const sortedUsers = [...users].sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
  /**
   * Checks if the user is existing or not, if not then it creates a new user and generates a token
   * for the user.
   * @param values - {
   */
  const handleSubmit = async (values) => {
    localForage.setItem('appMode', 'offline');
    logger.debug('Login.js', 'In handleSubmit');
    if (isElectron()) {
      // router.push('/main');
      // The below code is commented for UI dev purpose.
      if (handleValidation(values)) {
        const fs = window.require('fs');
        logger.debug(
          'LeftLogin.js',
          'Triggers handleLogin to check whether the user is existing or not',
        );
        const user = await handleLogin(users, values);
        if (user) {
          logger.debug(
            'LeftLogin.js',
            'Triggers generateToken to generate a Token for the user',
          );
          generateToken(user);
        } else {
          logger.debug(
            'LeftLogin.js',
            'Triggers createUser for creating a new user',
          );
          const user = await createUser(values, fs);
          logger.debug(
            'LeftLogin.js',
            'Triggers generateToken to generate a Token for the user',
          );
          generateToken(user);
        }
      }
    }
  };
  /**
   * When the form is submitted, prevent the default action, then call the handleSubmit function with
   * the values from the form, then reset the form values.
   * @param event - the event object
   */
  const displayError = (errorText) => {
    setNewOpen(true);
    setTimeout(() => {
      setNewOpen(false);
    }, 2000);
    setText(errorText);
  };
  function formSubmit(event) {
    event.preventDefault();
    const newValue = values;
    newValue.username = newValue.username.trim();
    if (newValue.username.length < 2 || newValue.username.length > 30) {
      displayError('The input has to be between 2 and 30 characters long');
    } else if (users.length > 0 && users.find((item) => (item.username.toLowerCase() === newValue.username.toLowerCase()))) {
      displayError('User exists, Check archived and active tab by click on view more.');
    } else {
      handleSubmit(newValue);
      setValues({});
    }
  }
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  function archiveUser(users, selectedUser) {
    const archivedUsers = users.map((user) => {
      if (user.username === selectedUser.username) {
        return { ...user, isArchived: true };
      }
      return user;
    });

    setUsers(archivedUsers);
    localForage.setItem('users', archivedUsers);
    writeToFile(archivedUsers);
  }
  function restoreUser(users, selectedUser) {
    const activeUsers = users.map((user) => {
      if (user.username === selectedUser.username) {
        return { ...user, isArchived: false };
      }
      return user;
    });
    setUsers(activeUsers);
    localForage.setItem('users', activeUsers);
    writeToFile(activeUsers);
  }
  const filterUsers = (user) => {
    if (user.isArchived === showArchived || (user.isArchived === undefined && showArchived === false)) {
      return true;
    }
    return false;
  };
  return (
    <div className="flex flex-col w-full h-full pt-32 items-center relative xl:pt-28">

      <div className="mt-10 flex flex-col gap-3 items-center justify-center pb-20 ">
        <LogoIcon
          className="h-16 w-16 group-hover:text-primary ml-5"
          aria-hidden="true"
        />
        <div className="text-white flex flex-col justify-center ">
          <h3 className="uppercase font-bold tracking-wider text-4xl text-black text-center">Scribe</h3>
          <q className="text-center italic text-sm mt-2 text-black">Scripture editing made simple</q>
        </div>
      </div>

      <p className="text-md text-black/80">{sortedUsers.length === 0 ? 'Welcome!' : 'Welcome back!'}</p>

      <div className="p-7 pb-0">

        <div
          id="users"
          className="relative border-gray-200 rounded-t-[10px] lg:w-72 w-44
          sm:w-52 overflow-hidden drop-shadow-xl shadow-xl"
        >
          {sortedUsers?.filter(filterUsers).slice(0, 5).map((user) => (
            <div
              key={user.username}
              id={user.username}
              className="p-4 py-2 text-sm cursor-pointer bg-[#F9F9F9] hover:bg-primary
                hover:text-white border-b-[1px] border-[#E3E3E3] font-semibold "
              tabIndex={0}
              role="button"
              aria-label="submit"
              onClick={() => {
                handleSubmit({ username: user?.username });
              }}
            >
              {user.username}
            </div>
          ))}
        </div>

        {sortedUsers.length === 0 ? (<div />) : (
          <div className="">
            <button
              type="button"
              onClick={openModal}
              id="view-more"
              className={`
                ${isOpen ? '' : 'text-opacity-90'
          } text-white bg-black w-48 text-xs lg:w-72 sm:w-52 py-[12px] flex 
              items-center justify-center text-md font-bold rounded-b-[10px] sm:text-sm drop-shadow-xl shadow-xl`}
            >
              View More
            </button>
          </div>
        )}

        <Transition
          appear
          show={isOpen}
          as={Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-50 text-left align-middle shadow-xl transition-all">
                    <Tab.Group onChange={() => setShowArchived((value) => !value)}>
                      <Tab.List className="flex space-x-0 rounded-xl">
                        <Tab
                          id="active-tab"
                          className={({ selected }) => classNames(
                            'w-full text-md items-center justify-center outline-none font-bold py-4 leading-5 rounded-t-lg',
                            '',
                            selected
                              ? 'text-primary  bg-gray-200'
                              : 'text-gray-400 hover:text-gray-500 border-b bg-white',
                          )}
                        >
                          Active
                        </Tab>
                        <Tab
                          id="archived-tab"
                          className={({ selected }) => classNames(
                            'w-full text-md items-center justify-center outline-none font-bold py-4 leading-5 rounded-t-lg',
                            selected
                              ? ' text-error  bg-gray-200 '
                              : 'text-gray-400 hover:text-gray-500 border-b bg-white ',
                          )}
                        >
                          Archived
                        </Tab>

                      </Tab.List>
                      <Tab.Panels>
                        <Tab.Panel className="relative overflow-y-auto h-[60vh] p-5">
                          <div className="grid grid-cols-2" id="active-tab-content">
                            {sortedUsers.filter(filterUsers).map((user) => (
                              <div className="flex items-center" key={user.username}>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  aria-label="submit"
                                  data-id={user.username}
                                  onClick={() => { handleSubmit({ username: user.username }); }}
                                  className="w-full p-4 py-3 text-sm rounded-lg cursor-pointer bg-[#F9F9F9] hover:bg-primary hover:text-white border border-[#E3E3E3] font-semibold"
                                >

                                  <p className="text-md font-semibold  ">
                                    {user.username}
                                  </p>
                                </div>
                                <button type="button" className="mx-3" onClick={() => archiveUser(sortedUsers, user)}>
                                  <TrashIcon className="text-gray-500 h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </Tab.Panel>
                        <Tab.Panel className="relative overflow-y-auto h-[60vh] p-5 ">
                          <div className="grid grid-cols-2" id="archive-tab-content">
                            {sortedUsers.filter(filterUsers).map((user) => (
                              <div className="flex items-center" key={user.username}>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  aria-label="restor user"
                                  className="w-full p-4 py-3 rounded text-sm cursor-pointer bg-[#F9F9F9] hover:bg-primary hover:text-white border border-[#E3E3E3] font-semibold"
                                >
                                  <p className="text-md font-semibold  ">
                                    {user.username}
                                  </p>
                                </div>
                                <button type="button" className="mx-3 " onClick={() => restoreUser(sortedUsers, user)}>
                                  <Restore className="text-gray-500 text-sm" />
                                </button>

                              </div>
                            ))}
                          </div>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <div>
          <button
            onClick={openAccountModal}
            type="button"
            aria-label="create-new-account"
            className="mt-10 mb-28  w-48 lg:w-72 sm:w-52 py-3 font-bold uppercase flex items-center
            text-xs justify-center  text-white bg-primary rounded sm:text-xs shadow-xl"
          >
            Create New Account
          </button>
          <Transition appear show={open} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={closeAccountModal}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <form className="flex min-h-full items-center justify-center p-4 text-center" onSubmit={formSubmit}>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="transform overflow-hidden rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg  leading-6 text-gray-400"
                      >
                        Create New User*
                      </Dialog.Title>

                      <div className="mt-4">
                        <input
                          type="text"
                          value={values.username}
                          onChange={handleChange}
                          className={`flex-shrink flex-grow flex-auto w-full border h-10 ${userNameError ? 'border-red-500' : 'border-primary'} rounded  px-3 self-center relative text-lg  leading-6 text-gray-700 outline-none`}
                          placeholder="Username"
                        />
                        {userNameError && (
                          <span className="text-red-500 font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                      {newOpen && (
                        <span id="show-error" className="text-red-500">{text}</span>
                      )}
                      <div className="mt-8 flex gap-8 justify-end">
                        <button
                          type="button"
                          aria-label="cancel"
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary px-12 py-2 text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeAccountModal}
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className={`inline-flex justify-center rounded-md border border-transparent ${newOpen ? 'bg-red-500' : 'bg-success'} px-12 py-2 text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                        >
                          CREATE
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </form>
              </div>
            </Dialog>
          </Transition>
        </div>

        {/* <div className="absolute w-full bg-red-200 bottom-5 text-xs lg:left-2 xl:left-24 flex sm:left-6  items-center justify-center sm:gap-8 gap-3 lg:gap-12 xl:gap-20 lg:text-sm font-semibold"> */}

      </div>

      <div className="flex gap-5 text-xs font-semibold">
        <a href="https://scribe.bible" target="_blank">
          SITE
        </a>
        <a href="https://docs.scribe.bible/" target="_blank">
          DOCS
        </a>
      </div>

    </div>
  );
};

export default LeftLogin;
