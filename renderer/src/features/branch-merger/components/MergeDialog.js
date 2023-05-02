import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRef } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function MergeDialog({ onSubmit, onCancel, open, isLoading, loadingProps }) {
  const descriptionRef = useRef(null);

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Merge</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Clicking submit will merge your current work with your team's work. Please add a comment below about the changes that you are submitting.
        </DialogContentText>
        <TextField
          inputRef={descriptionRef}
          autoFocus
          margin="dense"
          id="merge-description"
          label="Description"
          type="text"
          minRows={2}
          fullWidth
          multiline
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={() => {
            onSubmit(descriptionRef.current.value)
          }}
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? (
              <>
              <CircularProgress size='1rem' style={{ marginRight: '0.5rem' }} {...loadingProps} />{' '}
                {' Sending...'}
              </>
            ) : (
              'Submit'
            )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}