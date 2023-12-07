import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

export default function SearchTags({
  defaultQuery,
  contentList1,
  // contentList2,
  filterList,
  onfilerRequest1,
  // onfilerRequest2,
}) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState(defaultQuery);
  const excludeColumns = filterList.splice(filterList.indexOf(), 1);
  const onQuery = useCallback((_query, content) => {
    let filteredData;
    setQuery(_query);
    const lowercasedValue = _query.toLowerCase().trim();
    if (lowercasedValue === '') {
      return content;
    }
    if (content) {
      filteredData = content.filter(
        (item) => Object.keys(item).some((key) => (excludeColumns.includes(key)
          ? false
          : item[key]?.toString().toLowerCase().includes(lowercasedValue))),
      );
      return filteredData;
    }
  }, [excludeColumns]);

  // handle change event of search input
  const handleChange = (value) => {
    setQuery(value);
  };

  React.useEffect(() => {
    if (query) {
      onfilerRequest1(onQuery(query, contentList1));
      // onfilerRequest2(onQuery(query, contentList2));
    }
    if (!query) {
      onfilerRequest1(contentList1);
      // onfilerRequest2(contentList2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, contentList1]);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="h-5 w-5 absolute left-0 ml-4 my-2 text-primary" />
      <input
        data-testid="search"
        type="search"
        name="search_box"
        id="search_box"
        autoComplete="given-name"
        placeholder={t('label-search')}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 bg-gray-100 w-full md:w-80 block rounded-full shadow-sm sm:text-sm focus:ring-gray-500 focus:border-primary border-gray-300"
      />

    </div>

  );
}
SearchTags.propTypes = {
  /** Prefill the query search field. */
  defaultQuery: PropTypes.string,
  /** Array list of items  */
  contentList1: PropTypes.array,
  // contentList2: PropTypes.array,
  /** Array list to be filtered  */
  filterList: PropTypes.array,
  /** Function to propogate the returned repositories data array. */
  onfilerRequest1: PropTypes.func,
  // onfilerRequest2: PropTypes.func,
  /** Configuration required if paths are provided as URL. */
};
