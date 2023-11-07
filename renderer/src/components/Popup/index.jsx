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
            isSmall ? 'min-w-[30%] ' : 'min-w-[50%] ',
            'scrollbar-h-1/2 relative max-h-[96vh] rounded-xl bg-white px-5 text-left align-middle text-hc-blue-900 shadow-xl transition-all scrollbar-thin scrollbar-track-hc-gray-100 scrollbar-thumb-hc-gray-200  dark:bg-hc-darkgray-50  dark:text-hc-darkgray-400  dark:scrollbar-track-hc-darkgray-50 dark:scrollbar-thumb-hc-darkgray-200',
          )}
        >
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
}
