import { HTMLProps, forwardRef } from "react";
import cx from 'classnames';

export interface TextInputProps extends Omit<HTMLProps<HTMLInputElement>, 'label'> {
  label?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  className,
  ...etcProps
}, ref) => (
  <label>
    <span className="after:block after:content-[' ']">{label}</span>
    <input
      {...etcProps}
      className={cx('h-12 px-4 border border-gray-300 rounded-md block w-full bg-transparent', className)}
      ref={ref}
    />
  </label>
))

TextInput.displayName = 'TextInput'
