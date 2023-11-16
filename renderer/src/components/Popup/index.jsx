import { classNames } from '@/util/classNames';
import { usePopup } from './PopupContext';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './Dialog';

export default function PopUp({
  buttonStyle,
  buttonText,
  buttonIcon,
  isLarge,
  isSmall,
  children,
  maxWidth,
}) {
  const { isOpen, setIsOpen } = usePopup();
  const openModal = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };
  return (
    <div className="flex items-center justify-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger onClick={openModal} className={buttonStyle}>
          {buttonIcon}
          <span>{buttonText}</span>
        </DialogTrigger>
        <DialogContent
          className={classNames(
            maxWidth || '',
            isLarge ? 'overflow-y-auto' : '',
            isSmall ? 'min-w-[25%] ' : 'min-w-[50%] ',
            'relative max-h-[96vh] rounded-xl bg-white px-5 text-left align-middle shadow-xl transition-all border',
          )}
        >
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
}
