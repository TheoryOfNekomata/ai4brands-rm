import { getFormValues } from "@theoryofnekomata/formxtra";
import { useRouter } from "next/router";
import { FormEventHandler, useCallback, useMemo, useState } from "react";
import { Item } from 'src/common/models'

export interface UseItemModuleParams {
  initialItems?: Item[];
}

export const useItemModule = (params = {} as UseItemModuleParams) => {
  const router = useRouter();
  const [lastActionTimestamp, setLastActionTimestamp] = useState(() => Date.now());
  const [items, setItems] = useState(params?.initialItems ?? [] as Item[]);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);
  const [itemIdsToDelete, setItemIdsToDelete] = useState<string[]>([]);

  const onSubmitItem = useCallback<React.FormEventHandler<HTMLFormElement>>(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const { image: imageFileListRaw, id, ...values } = getFormValues(e.currentTarget, { getFileObjects: true });
    const imageFileList = imageFileListRaw as FileList | undefined;

    let fileUploadResponse: Response | undefined;

    if (imageFileList && imageFileList.length > 0) {
      const image = imageFileList[0] as File;
      fileUploadResponse = await fetch(`/api/uploads/${image.name}`, {
        method: 'PUT',
        body: new Blob([image]),
        headers: {
          'Content-Type': image.type,
        },
      });

      if (!fileUploadResponse.ok) {
        setError(new Error('Could not upload image'));
        setLoading(false);
        return;
      }
    }

    let response: Response;
    if (id) {
      response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          imageUrl: fileUploadResponse?.headers.get('Location'),
        }),
      });
    } else {
      response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          imageUrl: fileUploadResponse?.headers.get('Location') ?? '',
        }),
      });
    }

    if (response.ok) {
      const newItem = await response.json();
      setItems((items = []) => {
        if (id) {
          return items.map(item => item.id === id ? newItem : item);
        }

        return [...items, newItem];
      });
      setLastActionTimestamp(Date.now());
      setLoading(false);
      return;
    }
    setError(new Error('Could not add item'));
    setLoading(false);
  }, []);

  const onItemAction = useCallback<FormEventHandler<HTMLFormElement>>(async (e) => {
    e.preventDefault();
    const { id, action } = getFormValues(e.currentTarget, { submitter: (e.nativeEvent as unknown as Record<string, HTMLButtonElement>).submitter });
    if (action === 'delete') {
      setItemIdsToDelete((itemIdsToDelete = []) => [...itemIdsToDelete, id as string]);
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems((items = []) => items.filter(item => item.id !== id));
        setItemIdsToDelete((itemIdsToDelete = []) => itemIdsToDelete.filter(itemId => itemId !== id));
        setLastActionTimestamp(Date.now());
        if (router.query.id === id) {
          await router.replace('/owner/edit/items');
        }
      } else {
        setError(new Error('Could not delete item'));
      }
      return;
    }
  }, [router]);

  return useMemo(() => ({
    onSubmitItem,
    onItemAction,
    items,
    error,
    loading,
    lastActionTimestamp,
    itemIdsToDelete,
  }), [onSubmitItem, onItemAction, items, error, loading, lastActionTimestamp, itemIdsToDelete]);
}
