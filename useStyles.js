import * as React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import { Zoom } from '@material-ui/core';

const drawerWidth = 150;

export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: 55,
  },
  grow: {
    flexGrow: 1,
  },
  hide: {
    display: 'none',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  // RepositoryMenu and UserMenu
  avatar: {
    width: '35px',
    height: '35px',
  },
  modal: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    maxHeight: '80%',
    overflow: 'scroll',
  },
  dialogTitle: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export const Transition = React.forwardRef((props, ref) => (
  <Zoom
    style={{ transitionDelay: '50ms' }}
    direction="up"
    ref={ref}
    {...props}
  />
));
