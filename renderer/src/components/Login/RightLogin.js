import LogoIcon from '@/icons/logo.svg';
import Slider from '../ImageSlider/Slider';
import AudioEditorIcon from '@/illustrations/AudioEditor.svg';
import OBSEditorIcon from '@/illustrations/OBSEditor.svg';
// import GroupIcon from '@/illustrations/group.svg';

// import VectorOne from '@/illustrations/vector-one.svg';
// import HalfMoon from '@/illustrations/half-moon.svg';
// import Quote from '@/illustrations/quote.svg';

export default function RightLogin() {
  return (
    <div className="col-span-4 bg-secondary relative flex flex-col justify-center">

      <div className="my-5  mt-10 flex flex-col gap-3 items-center justify-center">
        <LogoIcon
          className="h-12 w-12 group-hover:text-primary"
          aria-hidden="true"
        />
        <div className="text-white flex flex-col justify-center ">
          <h3 className="uppercase font-bold tracking-wider text-3xl">Scribe Scripture</h3>
          <q className="text-center italic text-sm mt-2">Scripture editing made simple</q>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center relative mt-8">

        <div className="text-white/80 leading-9 relative max-w-[80%] text-center | border border-gray-800 p-10 rounded-xl">
          <p className="text-lg ">A Bible translation editor that is owned by and developed for the community which uses modern technology to solve the practical problems faced on the field in the current Bible translation context.</p>
        </div>

        <div className="mt-14 w-full mx-24 text-white">
          <Slider data={[
                  {
              id: 1, img: <AudioEditorIcon className="h-full w-full rounded-xl" />, title: 'USER CENTRIC', content: 'The application is built from the ground up get you started with little or no training while enabling both beginners and veteran to their best work!',
              },
                  {
              id: 2, img: <AudioEditorIcon className="h-full w-full rounded-xl" />, title: 'Oral Bible Translation', content: 'A flexible audio recording mode that has been successfully used for completing multiple drafts of OBT projects on the field.',
              },
                  {
              id: 3, img: <OBSEditorIcon className="h-full w-full rounded-xl" />, title: 'Collaborate', content: 'Sync your text projects across multiple collaborators',
              },
            ]}
          />
        </div>

      </div>

      <div className="">
        {/* <HalfMoon width={124} height={70} /> */}

      </div>

    </div>
  );
}
