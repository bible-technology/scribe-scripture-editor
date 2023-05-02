import React from 'react';
import { MdUpdate, MdUpdateDisabled } from 'react-icons/md';
import menuStyles from '@/layouts/editor/MenuBar.module.css';
import Badge from '@material-ui/core/Badge';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Tooltip } from '@material-ui/core';

export function UpdateBranchButton({
  onClick = () => undefined,
  isLoading = false,
  blocked = false,
  pending = false,
  loadingProps,
  title = 'Update my content',
  ...props
}) {
  const Icon = blocked ? MdUpdateDisabled : MdUpdate;
  return (
    <Tooltip title={title}>
      <span>
        <button
          type="button"
          key="update-from-master"
          className={`group ${menuStyles.btn}`}
          onClick={onClick}
          aria-label={title}
          style={{ cursor: 'pointer', ...props.style, ...((!pending | blocked) ? { color: 'rgba(0, 0, 0, 0.26)' } : {}) }}
        >
          {isLoading ? (
            <CircularProgress
              className="h-6 w-6"
              size={18}
              style={{
            margin: '3px 0px',
              }}
              {...loadingProps}
            />
        ) : (
          <Badge color="error" variant="dot" overlap="circular" invisible={!pending}>
            <Icon id="update-from-master-icon" className="h-6 w-6" />
          </Badge>
        )}
        </button>
      </span>
    </Tooltip>
  );
}
