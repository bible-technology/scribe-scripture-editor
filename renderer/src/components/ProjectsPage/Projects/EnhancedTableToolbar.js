import {
  Box, Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

const EnhancedTableToolbar = ({ title }) => (
  <Typography
    variant="h6"
    id="tableTitle"
    component="div"
  >
    <Box fontWeight={600} m={1}>
      {title}
    </Box>
  </Typography>
);

EnhancedTableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
};

export default EnhancedTableToolbar;
