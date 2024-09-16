/* eslint-disable no-tabs */
// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import Login from '../Login';
// import CustomLogin from '../CustomLogin';
// import { isElectron } from '../../../core/handleElectron';
// import AuthenticationContextProvider from '../AuthenticationContextProvider';
// // import { act } from 'react-dom/test-utils';

// describe('Login component tests', () => {
//   test('Should render Login component without error', () => {
//     render(
//   <AuthenticationContextProvider>
//     <Login />
//   </AuthenticationContextProvider>,
//     );
//   });
//   describe('Offline test', () => {
//     if (isElectron()) {
//       test('Should have tabs', async () => {
//       const { getByTestId } = render(<Login />);
//       const element = getByTestId('tabs');
//       expect(element).toHaveTextContent('OfflineOnline');
//       });
//     }
//     test('Should have called CustomLogin', async () => {
//       render(<CustomLogin />);
//     });
//   });

//   // describe('Online test', () => {
//   //   test('Update state on password change', async () => {
//   //     const { getByTestId } = render(<Login />);
//   //     const element = getByTestId('password-textfield');
//   //     const passwordTextfield = element.children[0];
//   //     await act(async () => {
//   //       fireEvent.change(passwordTextfield, {target: { value: 'testPassword' },});
//   //     });
//   //     expect(passwordTextfield.value).toEqual('testPassword');
//   //   });
//   // });

//   // test('Should click login button', async () => {
//   //   const mockLogin = jest.fn();
//   //   React.useState = jest.fn(() => ['', mockLogin]);
//   //   const { getByTestId } = render(<Login />);
//   //   const usernameTextfield = getByTestId('username-textfield');
//   //   const element = getByTestId('password-textfield');
//   //   const passwordTextfield = element.children[0];
//   //   const loginButton = getByTestId('login-button');
//   //   await act(async () => {
//   //     fireEvent.change(usernameTextfield, { target: { value: 'testUser' } });
//   //     fireEvent.change(passwordTextfield, {
//   //       target: { value: 'testPassword' },
//   //     });
//   //     fireEvent.click(loginButton);
//   //   });
//   //   expect(mockLogin).toHaveBeenCalled();
//   //   // expect(mockLogin).toBeCalledWith({
//   //   //   username: "testUser",
//   //   //   password: "testPassword",
//   //   //   showPassword: false,
//   //   // });
//   // });
// });
