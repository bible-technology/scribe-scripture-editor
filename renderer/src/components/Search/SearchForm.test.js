import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm';

function createData(name, language, date, view) {
    return {
      name, language, date, view,
    };
  }
  const contentList = [
    createData(
      'Project Arabic',
      'Arabic(arb)',
      '22 Apr 2020',
      '2020-09-15 14:33:26',
    ),
    createData(
      'Hindi New Testment',
      'Hindi(hin)',
      '21 may 2020',
      '2020-09-13 14:33:26',
    ),
    createData(
      'English NIV',
      'English(eng)',
      '2 May 2020',
      '2020-08-29 14:33:26',
    ),
    createData(
      'Kannada Revised',
      'kannada(knd)',
      '31 Jun 2021',
      '2020-01-15 14:33:26',
    ),
    createData(
      'new Malayalam',
      'Malayalam(mal)',
      '04 Jul 2020',
      '2020-03-15 6:33:26',
    ),
    createData(
      'New Testment Oriya',
      'Oriya(or)',
      '23 Feb 2010',
      '2018-04-21 8:33:26',
    ),
    createData(
      'English Old',
      'English(eng)',
      '17 Dec 2029',
      '2018-04-21 8:33:26',
    ),
  ];

  const filterList = ['name', 'language', 'date', 'view'];
  const mockSetLanguage = jest.fn();
  React.useState = jest.fn(() => ['', mockSetLanguage]);

test('SearchForm renders without error', () => {
  render(
  <SearchForm 
    defaultQuery="name" 
    contentList1={contentList}
    contentList2={contentList}
    filterList={filterList}
    onfilerRequest1={mockSetLanguage} 
    onfilerRequest2={mockSetLanguage}
    />);
});

test('should check the value on change', async () => {
    const { getByTestId } = render(
        <SearchForm 
            defaultQuery="name" 
            contentList1={contentList}
            contentList2={contentList}
            filterList={filterList}
            onfilerRequest1={mockSetLanguage}
            onfilerRequest2={mockSetLanguage}
        />);
        const searchField = getByTestId('searchfield');
        await act(async () => {
            fireEvent.change(searchField, { target: { value: 'eng' } });
        });
        expect(searchField).toHaveValue('eng');
})