// import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

function TranslationMergNavBar({
  currentUsfmJson, setSelectedChapter, selectedChapter, resolvedFileNames,
}) {
  const { t } = useTranslation();
  console.log({ currentUsfmJson });
  return (
    <div className="bg-white border-2 rounded-md border-black h-[78vh] overflow-hidden">
      <div className="flex items-center justify-between bg-black py-1.5 px-2.5">
        <span className="px-2.5 py-0.5 bg-primary text-white font-semibold tracking-wider text-xs uppercase rounded-xl">
          {` ${t('label-book')} - ${currentUsfmJson?.book?.bookCode || ''}`}
        </span>
        {/* <Cog8ToothIcon className="w-5 h-5 text-white" /> */}
      </div>

      <div className="h-full overflow-auto">
        <ul className="text-black text-xs pt-2.5">
          {currentUsfmJson?.chapters?.map((chapter) => (
            <li
              key={chapter.chapterNumber}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
              role="button"
              onClick={() => setSelectedChapter(chapter.chapterNumber)}
              aria-disabled={resolvedFileNames.includes(chapter.chapterNumber)}
              className={`px-5 py-2 ${resolvedFileNames.includes(chapter.chapterNumber)
                ? 'line-through decoration-2 pointer-events-none'
                : `${selectedChapter === chapter.chapterNumber ? 'bg-primary/70' : 'hover:bg-primary cursor-pointer'}`} `}
            >
              {chapter.chapterNumber}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TranslationMergNavBar;
