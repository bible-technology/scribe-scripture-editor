import moment from 'moment';

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd(number) {
      if (number < 7) {
        return `${number} days`; // Moment uses "d" when it's just 1 day.
      }
      const weeks = Math.round(number / 7);
      return `${weeks} ${weeks > 1 ? 'weeks' : 'week'}`;
    },
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
});

function descendingComparator(a, b, orderBy) {
  if (orderBy !== 'date' && (orderBy !== 'status') && orderBy !== 'editors') {
    if (b[orderBy]?.toLowerCase() < a[orderBy]?.toLowerCase()) {
      return -1;
    }
    if (b[orderBy]?.toLowerCase() > a[orderBy]?.toLowerCase()) {
      return 1;
    }
    return 0;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator, orderBy, dateorder) {
  if (orderBy !== 'date' && (orderBy !== 'status') && orderBy !== 'editors') {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) { return order; }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const dateA = new Date(a[0].date);
    const dateB = new Date(b[0].date);
    if (dateorder === 'desc') { return dateB - dateA; }
    return dateA - dateB;
  });
  return stabilizedThis.map((el) => el[0]);
}
