import { HtmlPerfEditor } from '@xelah/type-perf-html';

export default function FootNoteEditor(props) {
  const {
    sequenceIds,
    isLoading,
    htmlPerf,
    sectionable,
    blockable,
    editable,
    preview,
    verbose,
    graftSequenceId,
    addSequenceId,
    saveHtmlPerf,
    setGraftSequenceId,
  } = props;

  const sequenceId = sequenceIds && sequenceIds.at(-1);

  const style = isLoading || !sequenceId ? { cursor: 'progress' } : {};

  const handlers = {
    onBlockClick: ({ content: _content, element }) => {
      const _sequenceId = element.dataset.target;
      const { tagName } = element;
      const isInline = tagName === 'SPAN';
      // if (_sequenceId && !isInline) addSequenceId(_sequenceId);
      if (_sequenceId) { setGraftSequenceId(_sequenceId); }
    },
  };

  const _props = {
    htmlPerf,
    onHtmlPerf: saveHtmlPerf,
    sequenceIds,
    sequenceId,
    addSequenceId,
    options: {
      sectionable,
      blockable,
      editable,
      preview,
    },
    decorators: {},
    verbose,
    handlers,
  };

  const graftProps = {
    ..._props,
    sequenceIds: [graftSequenceId],
  };

  const graftSequenceEditor = htmlPerf && (
    <HtmlPerfEditor {...graftProps} />
  );

  return (
    <div className="editor" style={style}>
      {graftSequenceId ? graftSequenceEditor : ''}
    </div>
  );
}
