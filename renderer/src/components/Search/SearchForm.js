import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  InputBase,
  Toolbar,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { searchStyles } from './SearchStyles';
// import AwesomeDebouncePromise from 'awesome-debounce-promise';

function SearchForm({
  defaultQuery,
  contentList1,
  contentList2,
  filterList,
  onfilerRequest1,
  onfilerRequest2,
}) {
  const classes = searchStyles();
  const { t } = useTranslation();
  const [query, setQuery] = useState(defaultQuery);
  const excludeColumns = filterList.splice(filterList.indexOf(), 1);
  const onQuery = useCallback((_query, content) => {
    setQuery(_query);
    const lowercasedValue = _query.toLowerCase().trim();
    if (lowercasedValue === '') {
      return content;
    }
    const filteredData = content.filter(
      (item) => Object.keys(item).some((key) => (excludeColumns.includes(key)
        ? false
        : item[key].toString().toLowerCase().includes(lowercasedValue))),
    );
    return filteredData;
  }, [excludeColumns]);

  // handle change event of search input
  const handleChange = (value) => {
    setQuery(value);
  };

  React.useEffect(() => {
    if (query) {
      onfilerRequest1(onQuery(query, contentList1));
      onfilerRequest2(onQuery(query, contentList2));
    }
    if (!query) {
      onfilerRequest1(contentList1);
      onfilerRequest2(contentList2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className={classes.root}>
      <Toolbar>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <Search />
          </div>
          <InputBase
            placeholder={t('label-search')}
            id="search"
            label={t('label-search')}
            type="text"
            variant="outlined"
            fullWidth
            autoComplete={undefined}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{
              'aria-label': 'search',
              'data-testid': 'searchfield',
            }}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </Toolbar>
    </div>
  );
}

SearchForm.propTypes = {
  /** Prefill the query search field. */
  defaultQuery: PropTypes.string,
  /** Array list of items  */
  contentList1: PropTypes.array,
  contentList2: PropTypes.array,
  /** Array list to be filtered  */
  filterList: PropTypes.array,
  /** Function to propogate the returned repositories data array. */
  onfilerRequest1: PropTypes.func,
  onfilerRequest2: PropTypes.func,
  /** Configuration required if paths are provided as URL. */
};

export default SearchForm;
