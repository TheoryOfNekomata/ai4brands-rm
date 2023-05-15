import { ChangeEventHandler, HTMLProps, MouseEventHandler, forwardRef, useId, useRef, useState } from "react";
import cx from 'classnames';

export interface FileUploadAreaProps extends Omit<HTMLProps<HTMLInputElement>, 'label'> {
  label?: string;
  defaultPreviewUrls?: string[];
}

export const FileUploadArea = forwardRef<HTMLInputElement, FileUploadAreaProps>(({
  label,
  className,
  onChange,
  multiple = false,
  id: idProp,
  placeholder,
  defaultPreviewUrls = [],
  ...etcProps
}, ref) => {
  const [filesPreview, setFilesPreview] = useState(defaultPreviewUrls as string[]);
  const [selectedFiles, setSelectedFiles] = useState([] as File[]);
  const id = useId();
  const finalId = idProp ?? id;
  const defaultRef = useRef<HTMLInputElement>(null);
  const inputRef = ref ?? defaultRef;
  const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.currentTarget.files;

    if (files?.length) {
      const filesArray = Array.from(files);
      const previews = await Promise.all(
        filesArray.map((file) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.addEventListener('load', (loadEvent) => {
            if (loadEvent.target) {
              resolve(loadEvent.target.result as string);
              return;
            }
            reject(new Error('Failed to load file'));
          });

          reader.addEventListener('error', () => {
            reject(new Error('Failed to load file'));
          });

          reader.readAsDataURL(file);
        }))
      );
      setFilesPreview(previews);
      setSelectedFiles(filesArray);
      onChange?.(e);
    }
  }

  const removeFile = (index: number): MouseEventHandler<HTMLButtonElement> => (e) => {
    e.preventDefault();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilesPreview((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <span className="flex flex-col">
      <input
        {...etcProps}
        type="file"
        className="sr-only"
        ref={inputRef}
        onChange={handleChange}
        placeholder={placeholder}
        id={finalId}
      />
      {filesPreview.length > 0 && (
        <span>
          <label htmlFor={finalId}>
            <span className="after:block after:content-[' '] order-1">{label}</span>
          </label>
          <span className={cx('block flex justify-center items-center border border-gray-300 rounded order-3 overflow-auto', className)}>
            {filesPreview.map((p, i) => (
              <span key={selectedFiles[i]?.name ?? filesPreview[i]} className="block w-full relative">
                <img src={p} alt={selectedFiles[i]?.name ?? filesPreview[i]} className="block w-full"/>
                <button className="absolute top-2 right-2" type="button" onClick={removeFile(i)}>
                  &times;
                </button>
              </span>
            ))}
          </span>
        </span>
      )}
      {filesPreview.length < 1 && (
        <label className="cursor-pointer" htmlFor={finalId}>
          <span className="after:block after:content-[' '] order-1">{label}</span>
          {' '}
          <span className={cx('block flex justify-center items-center border border-gray-300 rounded order-3 overflow-auto', className)}>
            {placeholder}
          </span>
        </label>
      )}
    </span>
  )
})

FileUploadArea.displayName = 'FileUploadArea'
