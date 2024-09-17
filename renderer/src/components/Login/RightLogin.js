import Slider from '../ImageSlider/Slider';
import AudioEditorIcon from '@/illustrations/AudioEditor.svg';
import BibleEditorIcon from '@/illustrations/BibleEditor.svg';
import OBSEditorIcon from '@/illustrations/OBSEditor.svg';
// import GroupIcon from '@/illustrations/group.svg';

// import VectorOne from '@/illustrations/vector-one.svg';
// import HalfMoon from '@/illustrations/half-moon.svg';
// import Quote from '@/illustrations/quote.svg';

export default function RightLogin() {
  return (
    <div className="col-span-4 bg-secondary relative flex flex-col justify-center">

      <div className="flex flex-col justify-center items-center relative mt-8 lg:mt-0">

        <div className="text-white/80 leading-9 relative max-w-[80%] text-center | border border-gray-800 p-10 rounded-xl">
          <p className="text-base lg:text-lg ">A Bible translation editor that is owned by and developed for the community which uses modern technology to solve the practical problems faced on the field in the current Bible translation context.</p>
        </div>

        <div className="w-full mx-24 text-white">
          <Slider data={[
            {
              id: 1,
              img: <BibleEditorIcon className="h-full w-full rounded-xl" />,
              title: 'USER CENTRIC',
              content: 'Starting with little or no training, the application lets beginners and experts achieve their full potential!',
            },
            {
              id: 2,
              img: <AudioEditorIcon className="h-full w-full rounded-xl" />,
              title: 'Oral Bible Translation',
              content: 'a flexible manner has proven immensely useful in completing multiple OBT projects across various locations, regardless of the presence of scripts',
            },
            {
              id: 3,
              img: <OBSEditorIcon className="h-full w-full rounded-xl" />,
              title: 'Collaborate',
              content: 'On projects, it is possible for multiple people to collaborate together, both offline and online.',
            },
          ]}
          />
        </div>

      </div>

    </div>
  );
}
