# Renaming Section Ids


## Custom section IDs

Sometimes skip logic on form level (when skipping entire sections) becomes unreadable and difficult to maintain. This is because we use section IDs in skip logic statements. To make this easier to read for all users, there's the option to rename a section ID. 

!!! Warning 
    An incorrect modification of the HTML or a non-compliant section ID may results in loss of your form. Always create a copy of your form before you start doing this. 

To make skip logic more readable, it is better to use custom section IDs - those IDs are used in skip logic.

Rename a section ID in Tangerine is done by going into the HTML Editor and searching for tangy-form-item id="....." the part in quotations is the ID of the section 

<img src="../../assets/renameSection1.png" width="570">

Use only standard Latin characters, no accented words or special characters. We recommend to always start the section with "**section_**" and add some short descriptive words to it. For example, “section_orf_g1” or “section_reading_comp_g5” Section ids **cannot start with a number**

Here's a list of rules to follow when renaming section IDs. 

!!! Rules

    - Letters A-Z, and a-z, Digits from 0-9,  the underscore "_" character
    - No digits at the beginning of the ID
    - No spaces or special characters
    - Always start with "section_"
  
    Some **example** section IDs 
    
    - section_subtraction_1
    - section_subtraction_1
    - section_interview_ht
    - section_location


## Renaming a section ID video

<iframe width="560" height="315" src="https://www.youtube.com/embed/MJtZ1HyOK5w?cc_load_policy=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>

