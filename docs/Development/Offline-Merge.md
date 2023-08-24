# Offline Merge Development Document

Offline Merge or Local merge is a functionality to combine the project based on [<span style="color:#f0504a">Scripture Burrito</span>](https://docs.burrito.bible/en/latest/) with contributions from different collabarators

-   Current Support for OBS

## Expected Work Flow

-   open scribe app and create OBS project
-   export and share the project with collabarators
-   Collabarator need to import the project on his/her scribe app and edit assigned story/sections
-   export the project after finishing the work and send back the project to manager / owner. (He can also merge if he have somebody else changes).
-   Owner / Manager import the project from the collabarator to his/her scribe app
-   When the owner import the project , he will be prompted with a popup have 3 options _cancel_ , _replace_ and _merge_

-   click and proceed with _**merge**_ option.

### Case 1 - No Conflict

-   if there is no conflict in the merge process. Success message will be shown and all the combined changes will be avaialble in the project in scribe

### Case 2 - Conflict

-   If there is a conflict in the merge process , a new window of _**Conflict Resolver**_ will be pop up

-   In the conflict Resolver window , all files with conflict will be listed and conflicted content will be show in the editor window with multiple option to accept which change need to accept .

-   once all the conflict is finished . click done and finish the merge process

-   Now the project in scribe will have all combined changes.
