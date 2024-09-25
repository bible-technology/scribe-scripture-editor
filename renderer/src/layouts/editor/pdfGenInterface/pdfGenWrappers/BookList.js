import React from 'react';

export const BookList = ({ books }) => (
  <div
    style={{
      paddingBottom: '12px', borderRadius: 999, display: 'inline-flex', flexDirection: 'row', justifyContent: 'left', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}
  >
    {books.map((book, index) => (
      <div
        // eslint-disable-next-line
        key={index}
        style={{
          alignSelf: 'stretch', height: 30, padding: '4px 11px', backgroundColor: '#464646', borderRadius: 999, border: '1px solid #737373', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        }}
      >
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <div
            style={{
              color: 'white', fontSize: 14, fontFamily: 'Lato', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word',
            }}
          >
            {book}
          </div>
        </div>
      </div>
    ))}
  </div>
);
