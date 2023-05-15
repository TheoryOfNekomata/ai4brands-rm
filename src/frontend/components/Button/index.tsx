import { FC, HTMLProps } from "react"
import cx from 'classnames'

export interface ButtonProps extends Omit<HTMLProps<HTMLButtonElement>, 'type'> {
  type?: 'button' | 'reset' | 'submit'
}

export const Button: FC<ButtonProps> = ({
  className,
  children,
  type = 'button',
  ...etcProps
}) => {
  return (
    <button {...etcProps} className={cx('px-4 h-12 border border-gray-300 rounded-md uppercase font-bold', className)} type={type}>
      {children}
    </button>
  )
}
