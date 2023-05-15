import { HTMLProps, forwardRef } from "react";
import cx from 'classnames';

export interface MultilineTextInputProps extends Omit<HTMLProps<HTMLTextAreaElement>, 'label'> {
  label?: string;
}

export const MultilineTextInput = forwardRef<HTMLTextAreaElement, MultilineTextInputProps>(({
  label,
  className,
  ...etcProps
}, ref) => (
  <label>
    <span className="after:block after:content-[' ']">{label}</span>
    <textarea
      {...etcProps}
      className={cx('min-h-12 px-4 py-3 border border-gray-300 rounded-md block w-full resize-y bg-transparent', className)}
      ref={ref}
    />
  </label>
))

MultilineTextInput.displayName = 'MultilineTextInput'
