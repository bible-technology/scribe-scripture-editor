import React from "react";
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Tooltip } from '@material-ui/core';
import { MdOutlinePublish, MdPublish } from "react-icons/md";

export function MergeBranchButton({
  onClick = () => undefined,
  isLoading = false,
  blocked = false,
  pending = false,
  loadingProps,
  title = "Merge my work",
  ...props
}) {
  const Icon = blocked ? MdOutlinePublish : MdPublish
  return (
    <Tooltip title={title}>
      <span>
      <IconButton
        key='merge-to-master'
        onClick={onClick}
        aria-label={title}
        style={{ cursor: 'pointer',  ...props.style}}
        // disabled={!pending | blocked}
      > 
        {isLoading ? (
          <CircularProgress
            size={18}
            style={{
              margin: "3px 0px",
            }}
            {...loadingProps}
          />
        ) : (
          <Badge color="error" variant="dot" invisible={!pending}>
            <Icon id='merge-to-master-icon'/>
          </Badge>
        )}
      </IconButton>
      </span>
    </Tooltip>
  )
}
