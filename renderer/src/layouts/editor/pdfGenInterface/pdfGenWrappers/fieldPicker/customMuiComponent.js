import {
  Tooltip, tooltipClasses,
  alpha, Switch,
} from '@mui/material';
import { styled } from '@mui/system';

export const StyledSwitch = styled(Switch)(() => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#FF5500',
    '&:hover': {
      backgroundColor: '##FF7733',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#FF5500',
  },
}));

export const TextOnlyTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#292A2D',
    color: '#FFFFFF',
  },
}));

export const LoopSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#FF5500',
    '&:hover': {
      backgroundColor: alpha(
        '#FF5500',
        theme.palette.action.hoverOpacity,
      ),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#FF5500',
  },
}));
