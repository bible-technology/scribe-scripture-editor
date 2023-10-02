/* eslint-disable */
import React from 'react';
import { useRouter } from 'next/navigation';
import * as logger from '../../logger';
import useApi from './useApi';
import CustomLogin from '../Login/CustomLogin'
import { useTranslation } from 'react-i18next';
// import configData from '../../config.json';

export default function Signup() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state: { config }, action: { getFlow } } = useApi();
  const ui = {
    textfield: {
      count: [
        { label: t('label-email'), type: 'email', name: 'email' },
        { label: t('label-name'), type: 'text', name: 'identifier' },
        { label: t('label-password'), type: 'password', name: 'password' },
        { label: t('label-confirm-password'), type: 'password', name: 'password' },
      ],
    },
    viewForgot: false,
  };
  React.useEffect(() => {
    if (router?.query?.flow) {
      getFlow(router.query.flow);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query]);

  const [token, setToken] = React.useState();
  const [valid, setValid] = React.useState({
    username: false,
    email:false,
    password: false,
  });
  const [error, setError] = React.useState({
    identifier: '',
    password: '',
    msg: '',
  });

  // const handleValidation = (values) => {
  //   logger.debug('Singup.js', 'Into handleValidation');
  //   let validation;
  //   if (!values.firstname) {
  //     setValid({ ...valid, validfirstname: true });
  //     validation = false;
  //   } else if (!values.email) {
  //     setValid({ ...valid, validemail: true });
  //     validation = false;
  //   } else if (!values.password) {
  //     setValid({ ...valid, validpassword: true });
  //     validation = false;
  //   } else if (!values.confirmpassword) {
  //     setValid({ ...valid, validconfirmpassword: true });
  //     validation = false;
  //   } else {
  //     setValid(false);
  //     validation = true;
  //   }
  //   logger.debug('Singup.js', 'End handleValidation');
  //   return validation;
  // };
  React.useEffect(() => {
    if (config) {
      // eslint-disable-next-line prefer-const
      let err = {};
      err.msg = config?.messages?.[0]?.text;
      (config.fields).forEach((field) => {
        if (field.name === 'csrf_token') {
          setToken(field.value);
        } else {
          err[field.name] = field.messages?.[0].text;
        }
      });
      setError(err);
    }
  }, [config]);
  const handleSubmit = async (values) => {
    console.log("sub",values)
    setError({});
    logger.debug('Singup.js', 'Into handleSubmit');
    // if (handleValidation(values)) {
      // if (values.password === values.confirmpassword) {
        logger.debug('Singup.js, Passwords matched');
        router.push('/newproject');
        // The below code is commented for bypassing the authentication.
        // document.agsignup.action = config.action;
        // document.agsignup.method = config.method;
        // // eslint-disable-next-line prefer-const
        // let input = document.createElement('input');
        //   input.setAttribute('type', 'hidden');
        //   input.setAttribute('name', 'csrf_token');
        //   input.setAttribute('value', token);
        // document.agsignup.appendChild(input);
        // document.agsignup.submit();
      // } else {
      //   logger.debug('Singup.js', 'Passwords do not match');
      //   setValid({ ...valid, validconfirmpassword: true });
      //   setError({ msg: 'Passwords do not match' });
      // }
    // } else {
    //   Object.keys(valid).forEach((key) => {
    //     if (valid[key] === true) {
    //       logger.error('Singup.js', `Validation Failed for ${key}`);
    //     }
    //   });
    // }
  };

  return (
    <>
      <div>
        <div className="inline-block min-h-screen  bg-white w-5/12">
          <div className="ml-10 2xl:ml-40 mt-32">
            <div className="text-green-500 pb-12">
              {t('label-already-have-account')}
              <a
                data-testid="signup"
                href="/login"
                className="text-blue-600 ml-2"
              >
                {t('label-sign-in')}
                !
              </a>
            </div>
            <div className="text-3xl font-medium text-black"> Welcome!</div>
            <div className="text-lg
            font-light
            pb-14 text-gray-400"
            >
              {t('text-sign-up-quote')}
            </div>
            <CustomLogin
              ui={ui}
              error={valid}
              login={handleSubmit}
              userlist={[]}
              validation={error}
              buttonname={t('btn-signup')}
            />
            <div />
          </div>
          {/* <div className="2xl:ml-40 pt-72 2xl:pl-5 pl-14 space-x-14 sm:space-y-2
          text-black font-bold"
          >
            <a href="/">EN(US)</a>
            <a href="/">ABOUT</a>
            <a href="/">PRIVACY</a>
            <a href="/">TERMS</a>
          </div> */}
        </div>
        <div className="absolute
        inline-block bg-black min-h-screen w-7/12 pt-8 pl-40 pr-40"
        >
          <div className="grid grid-rows-1 justify-items-center relative">
            <div className="justify-center">
              <div className="flex gap-3 ">
                <img src="/logo.svg" alt="logo" />
                <div className="text-white">{t('app-name')}</div>
                <div className="text-blue-800 font-bold">2.0</div>
              </div>
              <div className="pt-8 pl-72">
                <img src="/illustrations/group.svg" alt="Group" />
              </div>
              <div className="w-96 pt-16 mb-10 text-xl text-white leading-9">
                <div className="pb-5">
                  <img src="/illustrations/quote.svg" alt="quote" />
                </div>

                Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Consectetur
                viverra facilisis platea malesuada faucibus justo.
                Donec sit amet diam, in. Arcu, felis sed tempor orci,
                pretium velit amet. Nullam amet, in justo a auctor sem felis.

                <div className="flex pt-5">
                  <div className="pr-4">FEATURE</div>
                  <img className="" src="/illustrations/green-check.svg" alt="logo" />
                </div>
              </div>
              <div className="flex pb-20">
                <div className="pl-24">
                  <img className="w-56 h-80" src="/illustrations/sitting.svg" alt="Sitting" />
                </div>
                <div>
                  <img className="pl-10" src="/illustrations/vector-one.svg" alt="VectorOne" />
                </div>
              </div>
            </div>
          </div>
          <div className=" bottom-0 pt-10 absolute left-5">
            <img src="/illustrations/half-moon.svg" alt="logo" />
          </div>
        </div>
      </div>
    </>
  );
}
