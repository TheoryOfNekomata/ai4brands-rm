import { Inter } from 'next/font/google'
import { GetServerSideProps, NextPage } from 'next'
import Link from 'next/link'
import { Item } from 'src/common/models'
import { useItemModule } from 'src/frontend/modules/item'
import { TextInput } from 'src/frontend/components/TextInput'
import { MultilineTextInput } from 'src/frontend/components/MultilineTextInput'
import { FileUploadArea } from 'src/frontend/components/FileUploadArea'
import { Button } from 'src/frontend/components/Button'
import cx from 'classnames'

const inter = Inter({ subsets: ['latin'] })

export interface OwnerPageProps {
  items: Item[];
  currentItem: Item | null;
}

const OwnerPage: NextPage<OwnerPageProps> = ({
  items: itemsProp,
  currentItem,
}) => {
  const { onSubmitItem, onItemAction, items, loading, lastActionTimestamp, itemIdsToDelete } = useItemModule({ initialItems: itemsProp });
  

  return (
    <main
      className={inter.className}
    >
      <div className="max-w-screen-lg mx-auto px-8">
        <div className="py-24">
          <h1 className="text-5xl font-bold">
            Brand Name
          </h1>
          <h2 className="text-3xl font-bold">
            Brand Owner
          </h2>
          <form onSubmit={onSubmitItem} className="my-12" key={lastActionTimestamp}>
            {currentItem && (
              <input type="hidden" name="id" value={currentItem.id} />
            )}
            <fieldset disabled={loading}>
              <legend>
                Add Item
              </legend>
              <div className="grid grid-cols-3 gap-8 my-8">
                <div className="col-span-2 flex flex-col gap-4">
                  <div>
                    <TextInput
                      name="name"
                      label="Name"
                      placeholder="Name"
                      type="text"
                      defaultValue={currentItem?.name}
                    />
                  </div>
                  <div>
                    <MultilineTextInput
                      name="description"
                      label="Description"
                      placeholder="Description"
                      rows={5}
                      defaultValue={currentItem?.description ?? undefined}
                    />
                  </div>
                </div>
                <div>
                  <FileUploadArea
                    name="image"
                    label="Image"
                    className="h-59"
                    placeholder="Upload your image here."
                    defaultPreviewUrls={currentItem && currentItem.imageUrl ? [currentItem.imageUrl] : undefined}
                  />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <TextInput
                    name="price"
                    label="Price (PHP)"
                    placeholder="0.00"
                    type="text"
                    defaultValue={currentItem?.price}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                  >
                    {currentItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
          <hr className="my-12" />
          {
            items.length > 0 &&
            (
              <>
                <p className="my-12">
                  Here are the available items:
                </p>
                <div className="flex flex-col gap-8">
                  {items.map((item) => (
                    <div key={item.id} className={cx({ 'opacity-50': itemIdsToDelete.includes(item.id), 'bg-blue-300 dark:bg-blue-700 text-white': currentItem && item.id === currentItem.id }, 'relative')}>
                      <Link
                        href={`/owner/edit/items/${item.id}`}
                      >
                        <div className="p-4">
                          <div
                            className="grid grid-cols-4 gap-8"
                          >
                            <div>
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full object-cover object-center h-50"
                              />
                            </div>
                            <div className="col-span-3 flex flex-col justify-between">
                              <div>
                                <strong>
                                  {item.name}
                                </strong>
                                <div>
                                  {item.description}
                                </div>
                              </div>
                              <div className="text-right">
                                PHP
                                {' '}
                                <span className="text-2xl">
                                  {item.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <form
                        className="absolute top-0 right-0 p-4"
                        onSubmit={onItemAction}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          name="action"
                          value="delete"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  ))}
                </div> 
              </>
            )
          }
          {
            items.length < 1
            && (
              <div className="text-center py-12">
                Previously added items will appear here.
              </div>
            )
          }
        </div>
      </div>
    </main>
  )
}

export default OwnerPage

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const url = new URL('/api/items', 'http://localhost:3000')
  const itemsResponse = await fetch(url.toString());
  const items = await itemsResponse.json() as Item[];
  const currentItemId = ctx.query.id;
  const currentItem = currentItemId ? items.find((item) => item.id === currentItemId) : null;

  if (currentItemId && !currentItem) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      items,
      currentItem,
    },
  };
}
