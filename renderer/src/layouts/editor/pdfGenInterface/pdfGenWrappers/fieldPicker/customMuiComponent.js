import { Tooltip, tooltipClasses,Checkbox,checkboxClasses } from '@mui/material';
import { styled } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { alpha } from '@mui/material';

export const StyledSwitch = styled(Switch)(({ theme }) => ({
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
))(({ theme }) => ({
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