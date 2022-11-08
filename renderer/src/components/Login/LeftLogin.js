import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import React, {
  Fragment, useContext, useEffect, useState,
} from 'react';
import * as localForage from 'localforage';
import { createUser, handleLogin } from '../../core/Login/handleLogin';
import { isElectron } from '../../core/handleElectron';
import * as logger from '../../logger';
import { AuthenticationContext } from './AuthenticationContextProvider';

const LeftLogin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});

  const router = useRouter();

  const [users, setUsers] = useState([]);
  const {
    action: { generateToken },
  } = useContext(AuthenticationContext);
  // eslint-disable-next-line no-unused-vars
  const [valid, setValid] = useState({
    username: false,
    password: false,
  });

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
  }
  function openModal() {
    setIsOpen(true);
  }
  function closeAccountModal() {
    setOpen(false);
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
    } else {
      // eslint-disable-next-line no-lonely-if
      if (isElectron()) {
        router.push('/projects');
      } else {
        router.push('/');
      }
    }
  };
  /**
   * When the form is submitted, prevent the default action, then call the handleSubmit function with
   * the values from the form, then reset the form values.
   * @param event - the event object
   */
  function handleAdd(event) {
    event.preventDefault();
    handleSubmit(values);
    setValues({});
  }

  return (
    <div className="flex flex-col pt-64 pl-10 md:pt-64 sm:pl-12 md:pl-20 sm:pt-56 w-full">
      <h2 className="text-2xl font-sans font-bold">Welcome!</h2>
      <p className="text-[#8692A6] text-sm mt-[4px]">
        Welcome back! Login to access Autographa
      </p>
      <div className="p-5">
        <div className="relative border border-gray-200 rounded-t-[10px] lg:w-72 w-44 sm:w-52 overflow-hidden">
          {sortedUsers.slice(0, 5).map((user) => (
            <div
              key={user}
              className="p-4 py-2 text-sm cursor-pointer bg-[#F9F9F9] hover:bg-primary hover:text-white border-b-[1px] border-[#E3E3E3] font-semibold"
              tabIndex={0}
              role="button"
              onClick={() => {
                handleSubmit({ username: user.username });
              }}
            >
              {user.username}
            </div>
          ))}
        </div>
        <div className="">
          <button
            type="button"
            onClick={openModal}
            className={`
                                     ${isOpen ? '' : 'text-opacity-90'
              } text-white bg-black w-48 text-xs lg:w-72 sm:w-52 py-[12px] flex items-center justify-center text-md font-bold rounded-b-[10px] sm:text-sm`}
          >
            View More
          </button>
        </div>
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
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="relative grid gap-10 p-7 grid-cols-2 auto-cols-auto">

                      {sortedUsers.map((user) => (
                        <button
                          type="button"
                          key={user}
                          onClick={() => { handleSubmit({ username: user.username }); }}
                          className="-m-3 flex items-center py-3 text-sm text-gray-900 cursor-pointer bg-gray-100 hover:bg-primary hover:text-white border rounded-lg border-[#E3E3E3] font-bold"
                        >
                          <div className="ml-4">
                            <p className="text-md font-semibold ">
                              {user.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
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
            className="mt-16 mb-28  w-48 lg:w-72 sm:w-52 py-3 font-bold uppercase flex items-center text-xs justify-center  text-white bg-primary rounded  shadow sm:text-xs"
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
                <form className="flex min-h-full items-center justify-center p-4 text-center" onSubmit={handleAdd}>
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

                      <div className="mt-8 flex gap-8 justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary px-12 py-2 text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeAccountModal}
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-success px-12 py-2 text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
        <div className="absolute bottom-5 text-xs lg:left-12 xl:left-24 flex sm:left-6  items-center justify-center sm:gap-8 gap-3 lg:gap-12 xl:gap-20 lg:text-sm font-semibold">
          <a href="/" onClick={(event) => event.preventDefault()}>
            EN(US)
          </a>
          <a href="/" onClick={(event) => event.preventDefault()}>
            ABOUT
          </a>
          <a href="/" onClick={(event) => event.preventDefault()}>
            PRIVACY
          </a>
          <a href="/" onClick={(event) => event.preventDefault()}>
            TERMS
          </a>
        </div>
      </div>

    </div>
  );
};

export default LeftLogin;
