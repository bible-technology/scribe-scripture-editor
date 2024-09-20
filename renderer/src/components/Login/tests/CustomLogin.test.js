import React from 'react';
import { render } from '@testing-library/react';
import CustomLogin from '../CustomLogin'
const online = {
  textfield: {
    count: [
      { label: 'Username', type: 'text', name: 'identifier' },
    ],
  },
  viewForgot: true,
};
const offline = {
  autocomplete: { count: [{ label: 'Username' }] },
  viewForgot: false,
};
describe('Login component tests', () => {
  test('Should render CustomLogin component without error', () => {
    render(<CustomLogin />);
  });
  test('Should have text box', async () => {
    const { getByTestId } = render(<CustomLogin ui={online}/>);
    const textbox = getByTestId('text-box');
    expect(textbox.type).toEqual('text');
  });
  test('Should have login button', async () => {
    const { getByTestId } = render(<CustomLogin />);
    const button = getByTestId('login-button');
    expect(button.type).toEqual('submit');
  });
});
