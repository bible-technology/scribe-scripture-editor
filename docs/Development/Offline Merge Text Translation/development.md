## Offline Merge Transaltion

-   Offline Merge Feature for Text Translation
-   Merge Option available on Import Existing Project ( Flavour Text Translation )
-   The Merge Can be resumed later from the check point ( Check Point will be the completion of each chapter. The system will only take care of chapter by chapter . You can not stop and continue from middle of a chapter )
-   The merge will be corrupted if back end data is modified / removed manually. Can not be restored
-   One commit will be created on merge start with all the changes before the merge ( timestamp and commit message can be used to identify the commit)
-   One commit will be created after the merge with all the merged changes ( timestamp and commit message can be used to identify)
-   This commit can be used to revert back to earlier stage ( **advanced option** )
-   Can not re work on chapter or book once you finish the conflicts with book / chapter
-   updating `metadata.json` with new USFM's metadata on finish merge conflict for entire project
-   Merge UI ( options)
    -   Accept all new changes
    -   Keep All existing changes
    -   Revert All changes
    -   Accept single changes ( current or new )
    -   Chapter Completion ( Check point )
    -   Merge Conflict Completion ( on completion : replace the original USFM with new merge USFM )
