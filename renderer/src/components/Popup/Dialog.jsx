import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
// import { IconX } from '@tabler/icons';

import { classNames } from '@/util/classNames';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({
  className,
  children,
  ...props
}) => (
  <DialogPrimitive.Portal className={classNames(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef(
  ({
    className,
    ...props
  }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={classNames(
        'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100',
        className,
      )}
      {...props}
    />
  ),
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
  ({
    className,
    children,
    ...props
  }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={classNames(
          'animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0 fixed z-50 grid gap-4 rounded-b-lg border bg-background shadow-lg focus:outline-none dark:border-none sm:rounded-lg',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={classNames(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={classNames(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef(
  ({
    className,
    ...props
  }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={classNames(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  ),
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(
  ({
    className,
    ...props
  }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={classNames('text-sm text-muted-foreground', className)}
      {...props}
    />
  ),
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
