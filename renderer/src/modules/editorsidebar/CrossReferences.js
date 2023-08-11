import { useTranslation } from 'react-i18next';
import GraftEditor from './GraftEditor';

export default function CrossReference(props) {
  // const [isEditCrossReferenceOpen, setEditCrossReference] = useState(false);
  // const [chapterNumber, setChapterNumber] = useState(1);
  // const [verseNumber, setVerseNumber] = useState(1);
  // const [refBookName, setRefBookName] = useState('');
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-gray-800 uppercase text-white text-xs p-2 tracking-wider">
        {t('label-cross-ref')}
      </div>
      <div className="overflow-y-auto h-full no-scrollbars">
        {/* <BibleNavigationXref
          chapterNumber={chapterNumber}
          setChapterNumber={setChapterNumber}
          verseNumber={verseNumber}
          setVerseNumber={setVerseNumber}
          refBookName={refBookName}
          setRefBookName={setRefBookName}
        /> */}
        <GraftEditor {...props} />
        {/* {references.map((section) => (
          <>
            <div className="flex justify-between items-center bg-gray-200 p-2 pr-2 text-sm font-semibold tracking-wider">
              <div className="flex items-center">
                <span className="inline-flex items-center pr-2 text-gray-400 text-sm">
                  <ChevronDownIcon className="w-5 h-5" />
                </span>
                <span>{section.title}</span>
              </div>
              <div className="flex justify-end items-center">
                <span className="inline-block px-2 bg-gray-400 rounded-full text-xxs">{section.list.length}</span>
                {!isEditCrossReferenceOpen
                  && (
                    <button
                      type="button"
                      className="ml-2 p-1 rounded bg-primary text-white"
                      onClick={() => setEditCrossReference(true)}
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  )}
              </div>
            </div>

            <div className="mt-3 tracking-wider text-xs relative">
              {section.list.map((list) => (
                <>
                  <h5 className="h-6 mx-4 font-semibold flex justify-between items-center content-center group">
                    <div>{list.ref}</div>
                    <div className="flex justify-end">

                      <button type="button" className="bg-gray-200 p-1 rounded-sm hidden group-hover:block">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </h5>
                  <p className="mx-4 leading-5 py-1 pb-4">{list.refText}</p>
                </>
              ))}

              {isEditCrossReferenceOpen && <EditCrossReference closeReference={()=>setEditCrossReference(false)}/>}

            </div>
          </>

        ))} */}
      </div>
    </>
  );
}
