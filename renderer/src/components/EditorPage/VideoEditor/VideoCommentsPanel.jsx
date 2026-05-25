import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import * as localforage from 'localforage';
import {
  CheckIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import VideoRecorder from './VideoRecorder';
import * as logger from '../../../logger';

const getCurrentUsername = async () => {
  const userProfile = await localforage.getItem('userProfile');
  return userProfile?.username || userProfile?.user?.email || 'unknown-user';
};

const getStructureFilePath = (videoPath, bookId) => {
  const path = window.require('path');
  const bookFolder = path.dirname(videoPath);
  return path.join(bookFolder, `${bookId.toLowerCase()}.json`);
};

const readStructureFile = (structureFile) => {
  const fs = window.require('fs');
  if (!fs.existsSync(structureFile)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(structureFile, 'utf8'));
  } catch (err) {
    logger.warn('Could not parse video structure while saving comments:', err);
    return {};
  }
};

const toStructureVerse = (verse) => {
  const verseData = {
    verseNumber: verse.verseNumber,
    verseText: verse.verseText || '',
    joinedVerses: verse.joinedVerses || null,
    isPreCombined: verse.isPreCombined || false,
  };

  if (verse.verseSegments) {
    verseData.verseSegments = verse.verseSegments;
  }

  if (Array.isArray(verse.comments) && verse.comments.length > 0) {
    verseData.comments = verse.comments;
  }

  return verseData;
};

const writeVerseComments = ({
  bookId,
  chapter,
  verseNumber,
  verseData,
  videoPath,
  comments,
  chapterContent,
}) => {
  const fs = window.require('fs');
  const path = window.require('path');
  const bookIdUpper = bookId.toUpperCase();
  const structureFile = getStructureFilePath(videoPath, bookId);
  const chapterKey = chapter.toString();
  const allStructure = readStructureFile(structureFile);

  if (!allStructure[bookIdUpper]) {
    allStructure[bookIdUpper] = {};
  }

  if (
    !allStructure[bookIdUpper][chapterKey]
    || !Array.isArray(allStructure[bookIdUpper][chapterKey].verses)
  ) {
    allStructure[bookIdUpper][chapterKey] = {
      chapter: chapterKey,
      verses: (chapterContent || [])
        .filter((item) => item.verseNumber && item.verseText !== undefined)
        .map(toStructureVerse),
    };
  }

  const chapterData = allStructure[bookIdUpper][chapterKey];
  const existingIndex = chapterData.verses.findIndex(
    (item) => item.verseNumber === verseNumber,
  );
  const nextVerseData = {
    verseNumber,
    verseText: verseData?.verseText || '',
    joinedVerses: verseData?.joinedVerses || null,
    verseSegments: verseData?.verseSegments,
    isPreCombined: verseData?.isPreCombined || false,
  };

  if (comments.length > 0) {
    nextVerseData.comments = comments;
  }

  if (!nextVerseData.verseSegments) {
    delete nextVerseData.verseSegments;
  }

  if (existingIndex >= 0) {
    chapterData.verses[existingIndex] = {
      ...chapterData.verses[existingIndex],
      ...nextVerseData,
    };
    if (comments.length === 0) {
      delete chapterData.verses[existingIndex].comments;
    }
  } else {
    chapterData.verses.push(nextVerseData);
  }

  chapterData.lastModified = new Date().toISOString();
  fs.mkdirSync(path.dirname(structureFile), { recursive: true });
  fs.writeFileSync(structureFile, JSON.stringify(allStructure, null, 2), 'utf8');
};

const getNextCommentNumber = (comments) => comments.reduce(
  (max, comment) => Math.max(max, Number(comment.commentNumber) || 0),
  0,
) + 1;

const VideoCommentsPanel = ({
  open,
  verse,
  chapter,
  bookId,
  videoPath,
  content,
  onClose,
  onContentChange,
  setNotify,
  setSnackText,
  setOpenSnackBar,
  setOpenModal,
}) => {
  const [currentUser, setCurrentUser] = useState('unknown-user');
  const [isAdding, setIsAdding] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [pendingComment, setPendingComment] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addCommentRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const comments = useMemo(() => verse?.comments || [], [verse]);

  useEffect(() => {
    if (!open) {
      setIsAdding(false);
      setDraftText('');
      setEditingCommentId(null);
      setEditingText('');
      return;
    }
    getCurrentUsername().then(setCurrentUser);
  }, [open]);

  useEffect(() => {
    if (open && comments.length === 0 && !isAdding && !pendingComment) {
      setIsAdding(true);
    }
  }, [open, comments.length, isAdding, pendingComment]);

  useEffect(() => {
    if (
      isAdding
      && commentsContainerRef.current
    ) {
      setTimeout(() => {
        commentsContainerRef.current.scrollTo({
          top: commentsContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 50);
    }
  }, [isAdding]);

  if (!open || !verse) {
    return null;
  }

  const saveComments = (nextComments) => {
    try {
      const updatedContent = content.map((item) => (
        item.verseNumber === verse.verseNumber
          ? (() => {
            const updatedVerse = { ...item };
            if (nextComments.length > 0) {
              updatedVerse.comments = nextComments;
            } else {
              delete updatedVerse.comments;
            }
            return updatedVerse;
          })()
          : item
      ));

      writeVerseComments({
        bookId,
        chapter,
        verseNumber: verse.verseNumber,
        verseData: verse,
        videoPath,
        comments: nextComments,
        chapterContent: updatedContent,
      });

      onContentChange(updatedContent);
      setNotify('success');
      setSnackText('Comment saved');
      setOpenSnackBar(true);
    } catch (err) {
      logger.error('Error saving video comment:', err);
      setNotify('failure');
      setSnackText('Failed to save comment');
      setOpenSnackBar(true);
    }
  };

  const showCommentError = (message) => {
    setNotify('failure');
    setSnackText(message);
    setOpenSnackBar(true);
  };

  const createCommentDraft = ({ note, videoFileName = null }) => {
    const commentNumber = getNextCommentNumber(comments);

    return {
      id: `${chapter}-${verse.verseNumber}-${commentNumber}-${Date.now()}`,
      commentNumber,
      verseNumber: verse.verseNumber,
      videoFileName,
      note,
      username: currentUser,
    };
  };

  const handleSaveTextComment = () => {
    const note = draftText.trim();
    if (!note) {
      showCommentError('Add text or record a video before saving');
      return;
    }

    const now = new Date().toISOString();
    saveComments([...comments, {
      ...createCommentDraft({ note }),
      createdAt: now,
      updatedAt: now,
    }]);
    setDraftText('');
    setIsAdding(false);
  };

  const handleStartNewCommentRecording = () => {
    const commentNumber = getNextCommentNumber(comments);
    const videoFileName = `${chapter}_${verse.verseNumber}_${commentNumber}.webm`;

    setPendingComment({
      ...createCommentDraft({
        note: draftText.trim(),
        videoFileName,
      }),
      isNewComment: true,
    });
  };

  const handleStartCommentRecording = (comment) => {
    if (comment.username !== currentUser) {
      return;
    }

    const videoFileName = comment.videoFileName
      || `${chapter}_${verse.verseNumber}_${comment.commentNumber}.webm`;

    setPendingComment({
      ...comment,
      videoFileName,
      isNewComment: false,
    });
  };

  const handleRecordingComplete = ({ filename }) => {
    const now = new Date().toISOString();

    if (pendingComment.isNewComment) {
      saveComments([...comments, {
        ...pendingComment,
        videoFileName: filename,
        createdAt: now,
        updatedAt: now,
        videoUpdatedAt: now,
      }]);
    } else {
      saveComments(comments.map((comment) => (
        comment.id === pendingComment.id
          ? {
            ...comment,
            videoFileName: filename,
            updatedAt: now,
            videoUpdatedAt: now,
          }
          : comment
      )));
    }

    setPendingComment(null);
    setDraftText('');
    setIsAdding(false);
  };

  const handleDeleteVideo = (comment) => {
    if (comment.username !== currentUser || !comment.videoFileName) {
      return;
    }

    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const filePath = path.join(videoPath, comment.videoFileName);

      if (comment.videoFileName && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const hasText = Boolean((comment.note || '').trim());
      if (!hasText) {
        saveComments(comments.filter((item) => item.id !== comment.id));
        return;
      }

      saveComments(comments.map((item) => (
        item.id === comment.id
          ? {
            ...item,
            videoFileName: null,
            updatedAt: new Date().toISOString(),
          }
          : item
      )));
    } catch (err) {
      logger.error('Error deleting comment video:', err);
      setNotify('failure');
      setSnackText('Failed to delete video comment');
      setOpenSnackBar(true);
    }
  };

  const handleDeleteText = (comment) => {
    if (comment.username !== currentUser) {
      return;
    }

    if (!comment.videoFileName) {
      saveComments(comments.filter((item) => item.id !== comment.id));
      return;
    }

    saveComments(comments.map((item) => (
      item.id === comment.id
        ? {
          ...item,
          note: '',
          updatedAt: new Date().toISOString(),
        }
        : item
    )));
  };

  const confirmDeleteVideo = (comment) => {
    setOpenModal({
      openModel: true,
      title: 'Delete Comment Video?',
      confirmMessage: 'Are you sure you want to delete this comment video?',
      buttonName: 'Delete',
      action: 'custom',
      actionData: {
        callback: () => handleDeleteVideo(comment),
      },
    });
  };

  const confirmDeleteText = (comment) => {
    setOpenModal({
      openModel: true,
      title: 'Delete Comment?',
      confirmMessage: 'Are you sure you want to delete this comment?',
      buttonName: 'Delete',
      action: 'custom',
      actionData: {
        callback: () => handleDeleteText(comment),
      },
    });
  };

  const handleSaveEdit = (comment) => {
    if (comment.username !== currentUser) {
      return;
    }

    const nextNote = editingText.trim();
    if (!nextNote && !comment.videoFileName) {
      saveComments(comments.filter((item) => item.id !== comment.id));
      setEditingCommentId(null);
      setEditingText('');
      return;
    }

    const nextComments = comments.map((item) => (
      item.id === comment.id
        ? { ...item, note: nextNote, updatedAt: new Date().toISOString() }
        : item
    ));

    saveComments(nextComments);
    setEditingCommentId(null);
    setEditingText('');
  };

  const getVideoSrc = (fileName, version) => {
    const path = window.require('path');
    const cacheKey = version ? `?v=${encodeURIComponent(version)}` : '';
    return `file://${path.join(videoPath, fileName)}${cacheKey}`;
  };

  const formatCommentDate = (timestamp) => {
    if (!timestamp) { return ''; }

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between bg-secondary px-5 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">
              Comments -
              {' '}
              {bookId.toUpperCase()}
              {' '}
              {chapter}
              :
              {verse.verseNumber}
            </h2>
            <p className="text-sm text-gray-200">Video comments</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-white hover:bg-opacity-20"
            onClick={onClose}
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={commentsContainerRef}
          className="max-h-[70vh] overflow-auto p-5"
        >

          <div className="space-y-4">
            {comments.map((comment) => {
              const isOwnComment = comment.username === currentUser;
              const isEditing = editingCommentId === comment.id;
              const hasVideo = Boolean(comment.videoFileName);
              const hasText = Boolean((comment.note || '').trim());

              return (
                <div key={comment.id} className="rounded-md border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {comment.username}
                        </p>

                        <p className="text-sm text-gray-500">
                          Comment
                          {' '}
                          {comment.commentNumber}
                          {' '}
                          Verse
                          {' '}
                          {comment.verseNumber}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {formatCommentDate(comment.updatedAt || comment.createdAt)}
                      </p>
                    </div>

                    {isOwnComment && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm text-primary hover:bg-primary hover:text-white"
                          onClick={() => handleStartCommentRecording(comment)}
                          title={hasVideo ? 'Re-record video' : 'Record video'}
                        >
                          <VideoCameraIcon className="h-5 w-5" />
                        </button>
                        {hasVideo && (
                          <button
                            type="button"
                            className="rounded-full p-2 text-error hover:bg-red-50"
                            onClick={() => confirmDeleteVideo(comment)}
                            title="Delete video"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {hasVideo && (
                    <video
                      key={`${comment.videoFileName}-${comment.videoUpdatedAt || comment.updatedAt || ''}`}
                      controls
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      src={getVideoSrc(
                        comment.videoFileName,
                        comment.videoUpdatedAt || comment.updatedAt,
                      )}
                      className="mb-3 aspect-video w-full rounded-md bg-black"
                    >
                      <track kind="captions" src="" label="No captions available" />
                    </video>
                  )}

                  <div className="mb-2">
                    <p className="mb-2 text-xs font-medium text-gray-600 uppercase tracking-wide">Note</p>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <textarea
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          className="min-h-[80px] flex-1 rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Comment"
                        />
                        <button
                          type="button"
                          className="h-10 rounded-md bg-primary px-3 text-white"
                          onClick={() => handleSaveEdit(comment)}
                          title="Save note"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <p className="mb-3 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                        {hasText ? comment.note : 'No text note'}
                      </p>
                    )}
                  </div>

                  {!isEditing && isOwnComment && (
                    <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingText(comment.note || '');
                        }}
                        title="Edit note"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      {hasText && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-1.5 text-sm text-error hover:bg-red-50"
                          onClick={() => confirmDeleteText(comment)}
                          title="Delete note"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {isAdding && (
            <div
              ref={addCommentRef}
              className="mt-4 rounded-md border border-gray-200 p-4"
            >
              <label htmlFor="video-comment-note" className="mb-2 block text-sm font-medium text-gray-700">
                Add a note
              </label>
              <textarea
                id="video-comment-note"
                value={draftText}
                onChange={(event) => setDraftText(event.target.value)}
                className="min-h-[90px] w-full rounded-md border border-gray-300 p-3 text-sm"
                placeholder="Add a note for this video comment"
              />
              <div className="mt-3 flex justify-end gap-2">
                {comments.length > 0 && (
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
                    onClick={() => {
                      setIsAdding(false);
                      setDraftText('');
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm text-primary"
                  onClick={handleSaveTextComment}
                >
                  <CheckIcon className="h-5 w-5" />
                  Save note
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white"
                  onClick={handleStartNewCommentRecording}
                >
                  <VideoCameraIcon className="h-5 w-5" />
                  Record comment
                </button>
              </div>
            </div>
          )}

          {!isAdding && comments.length > 0 && (
            <div className="sticky -bottom-5 -mx-5 mt-4 flex justify-end border-t border-gray-100 bg-white px-5 pb-5 pt-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                onClick={() => setIsAdding(true)}
              >
                <PlusIcon className="h-5 w-5" />
                Add more comment
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingComment && (
        <VideoRecorder
          verse={verse.verseNumber}
          chapter={chapter}
          bookId={bookId}
          projectPath={videoPath}
          content={[verse]}
          mode="record"
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setPendingComment(null)}
          onVerseChange={() => { }}
          setOpenModal={setOpenModal}
          setNotify={setNotify}
          setSnackText={setSnackText}
          setOpenSnackBar={setOpenSnackBar}
          fileNameOverride={pendingComment.videoFileName}
          titleOverride={`Video Comment - ${bookId.toUpperCase()} ${chapter}:${verse.verseNumber} #${pendingComment.commentNumber}`}
          hideVerseNavigation
          disableExistingVideoCheck
          allowOverwriteExistingVideo
          hideDeleteButton
        />
      )}
    </div>
  );
};

VideoCommentsPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  verse: PropTypes.object,
  chapter: PropTypes.string.isRequired,
  bookId: PropTypes.string.isRequired,
  videoPath: PropTypes.string.isRequired,
  content: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onContentChange: PropTypes.func.isRequired,
  setNotify: PropTypes.func.isRequired,
  setSnackText: PropTypes.func.isRequired,
  setOpenSnackBar: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
};

export default VideoCommentsPanel;
