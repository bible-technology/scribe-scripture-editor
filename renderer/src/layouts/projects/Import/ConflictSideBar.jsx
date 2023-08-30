import { Cog8ToothIcon } from '@heroicons/react/24/outline';

function ConflictSideBar({
  conflictData, setSelectedFileName, selectedFileName, resolvedFileNames,
 }) {
   return (
     <div className="bg-white border-2 rounded-md border-black h-full">
       <div className="flex items-center justify-between bg-black py-1.5 px-2.5">
         <span className="px-2.5 py-0.5 bg-primary text-white font-semibold tracking-wider text-xs uppercase rounded-xl">
           {`${conflictData?.data?.files?.filepaths.length || 0} files`}
         </span>
         <Cog8ToothIcon className="w-5 h-5 text-white" />
       </div>
       <ul className="text-black text-xs pt-2.5">
         {conflictData?.data?.files?.filepaths?.sort()?.map((file) => (
           <li
             key={file}
             // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
             role="button"
             onClick={() => setSelectedFileName(file)}
             aria-disabled={resolvedFileNames.includes(file)}
             className={`px-5 py-2 ${resolvedFileNames.includes(file)
             ? 'line-through decoration-2 pointer-events-none'
             : `${selectedFileName === file ? 'bg-primary/70' : 'hover:bg-primary/50 cursor-pointer'}`} `}
           >
             {file}
           </li>
        ))}
       </ul>
     </div>
   );
 }

 export default ConflictSideBar;
