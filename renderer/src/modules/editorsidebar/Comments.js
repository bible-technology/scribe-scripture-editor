import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

import EditComment from './EditComment';

const comments = [
  {
    id: 1,
    title: 'Genesis 1:1 In the beginning',
    list: [
      {
        id: 1,
        image_url: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Arpit Jacob',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
      {
        id: 2,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Andrew Jones',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
    ],
  },
  {
    id: 2,
    title: 'James 1:1',
    list: [
      {
        id: 3,
        image_url: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Arpit Jacob',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
      {
        id: 4,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Andrew Jones',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
    ],
  },
  {
    id: 3,
    title: 'Peter 1:1',
    list: [
      {
        id: 5,
        image_url: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Arpit Jacob',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
      {
        id: 6,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        name: 'Andrew Jones',
        commentText: 'This is a really long comment about this is not in the translation this I am going to leave.',
        postedAt: '2 days Ago',
      },
    ],
  },
];

export default function Comments() {
  const [isEditCommentOpen, setEditComment] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-gray-800 uppercase text-white text-xs p-2 tracking-wider">
        {t('label-comments')}
      </div>

      <div className="overflow-y-auto h-full no-scrollbars">

        {comments.map((section) => (
          <>
            <div
              key={`section-${section.id}`}
              className="flex justify-between items-center bg-gray-200 p-2 pr-5 text-sm font-semibold tracking-wider"
            >
              <div className="flex items-center">
                <span className="inline-flex items-center pr-2 text-gray-400 text-sm">
                  <ChevronDownIcon className="w-5 h-5" />
                </span>
                <span>{section.title}</span>
              </div>
              <span className="inline-block px-2 bg-gray-400 rounded-full text-xxs">2</span>
            </div>

            <div className="mt-3 tracking-wider text-xs relative">

              {section.list.map((list) => (
                <>
                  <div
                    key={`commentlist-${list.id}`}
                    className="flex justify-between mx-4 items-center"
                  >

                    <div className="flex items-center">
                      <img
                        className="inline-block h-8 w-8 mr-2 rounded-full ring-2 ring-white"
                        src={list.image_url}
                        alt=""
                      />
                      <h5 className="font-semibold">{list.name}</h5>
                    </div>

                    <span className="text-right text-xxs text-gray-400">{list.postedAt}</span>
                  </div>
                  <p className="leading-5 mx-4 py-2 pb-4">
                    {list.commentText}
                  </p>
                </>
              ))}

              {isEditCommentOpen ? <EditComment /> : (
                <button
                  type="button"
                  className="p-1 absolute right-2 bottom-2 rounded bg-primary text-white"
                  onClick={() => setEditComment(true)}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </button>
              )}

            </div>

          </>

        ))}

      </div>
    </>
  );
}
