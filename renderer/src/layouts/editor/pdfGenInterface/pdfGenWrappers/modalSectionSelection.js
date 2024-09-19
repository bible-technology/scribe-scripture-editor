/* eslint-disable */
import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TwoColumn from '../../../../../../public/icons/sectionIcons/2Column.svg';
import FourColumn from '../../../../../../public/icons/sectionIcons/4Column.svg';
import Bcv from '../../../../../../public/icons/sectionIcons/bcv.svg';
import BiblePlusNotes from '../../../../../../public/icons/sectionIcons/biblePlusNotes.svg';
import ParaBible from '../../../../../../public/icons/sectionIcons/paraBible.svg';
import Markdown from '../../../../../../public/icons/sectionIcons/markdown.svg';
// import JxlSpread from '../../../../../../public/icons/sectionIcons/jxlSpread.svg';
import JxlSimple from '../../../../../../public/icons/sectionIcons/jxlSimple.svg';
import Obs from '../../../../../../public/icons/sectionIcons/obs.svg';
import ObsPlusNote from '../../../../../../public/icons/sectionIcons/obsPlusNotes.svg';
import Note from '../../../../../../public/icons/sectionIcons/bookNote.svg';
import '../../../../../../styles/globals.css';

const TwoColumnItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <TwoColumn />
    </div>
    <div className="styleText">Two resources in two columns</div>
  </div>
);

const FourColumnItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <FourColumn />
    </div>
    <div className="styleText">Four resources on facing pages</div>
  </div>
);

const BCVBibleItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <Bcv />
    </div>
    <div className="styleText">Bible by verse</div>
  </div>
);

const BiblePlusNotesItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <BiblePlusNotes />
    </div>
    <div className="styleText">Notes focus (by verse)</div>
  </div>
);

const ParaBibleItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <ParaBible />
    </div>
    <div className="styleText">Formatted Bible</div>
  </div>
);

const MarkdownItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <Markdown />
    </div>
    <div className="styleText">Simple formatting</div>
  </div>
);

// const JxlSpreadItem = (
//   <div className="styleCard">
//     <div className="styleIcon">
//       <JxlSpread />
//     </div>
//     <div className="styleText">Juxtalinear on facing pages</div>
//   </div>
// );

const JxlSimpleItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <JxlSimple />
    </div>
    <div className="styleText">Juxtalinear</div>
  </div>
);

const ObsItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <Obs />
    </div>
    <div className="styleText">Obs</div>
  </div>
);

const ObsPlusNotesItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <ObsPlusNote />
    </div>
    <div className="styleText">Obs with Notes</div>
  </div>
);

const NoteItem = (
  <div className="styleCard">
    <div className="styleIcon">
      <Note />
    </div>
    <div className="styleText">Book Note</div>
  </div>
);

// Function to return the appropriate component based on the table entry
function getItemComponent(e) {
  switch (e) {
  case 'bcvBible':
    return BCVBibleItem;
  case 'bookNote':
    return NoteItem;
  case '4ColumnSpread':
    return FourColumnItem;
  case '2Column':
    return TwoColumnItem;
  case 'biblePlusNotes':
    return BiblePlusNotesItem;
  case 'paraBible':
    return ParaBibleItem;
  case 'markdown':
    return MarkdownItem;
    // case 'jxlSpread':
    //   return JxlSpreadItem;
  case 'jxlSimple':
    return JxlSimpleItem;
  case 'obs':
    return ObsItem;
  case 'obsPlusNotes':
    return ObsPlusNotesItem;
  default:
    return null;
  }
}

export function ModalSectionSelection({
  setSelected, open, setOpen, table,
}) {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          width: 600,
          p: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            {table.map((e, index) => (
              <Grid item xs={3} key={`grid-${index}`} onClick={() => setSelected(e)}>
                {getItemComponent(e)}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}
