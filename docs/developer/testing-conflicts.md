# Testing Conflicts

## Scenario: 2 Tablets working on the same case

### DiffType: EventForm data conflict 4 - Tablet 1 opens but doesn't complete Event Form, Tablet 2 opens and completes Event Form

Steps:
- Create a new case with pwa1. Fill out "Registration for Role 1" - enter '0' for "How many participant of type Role 2 would you like to enroll in this case?", submit. Sync
- In PWA2, sync. Enter the case you just synced. Create a New Event of type "An Event with an event form you can delete" and complete the form in "An Event with an Event Form you can delete." Sync.
- In PWA1, Enter the same case (don't sync yet) and create a New Event of type "An Event with an event form you can delete". Complete the form in "An Event with an Event Form you can delete." Sync. *This should create a conflict.* 
  - Check data/issues on server - should be two DIFF_TYPE__EVENT_FORMs and one  DIFF_TYPE__METADATA. Merged: true.
  - Check the case on PWA1 - how many instances of "An Event with an Event Form you can delete" are there? Are they duplicates, or does it have the one from PWA2?
- In PWA2, sync. *This should create a conflict.* 
  - Check data/issues on server - there may be three DIFF_TYPE__EVENT_FORMs and one  DIFF_TYPE__METADATA. Merged: true.
  - Check the case on PWA2 - how many instances of "An Event with an Event Form you can delete" are there? Are they duplicates, or does it have the one from PWA2?

### DiffType: Metadata - Modify Case variables on Tablet 1 and Tablet 2
Steps:
- ...

### DiffType: Event - Tablet 1 creates an new Event and Tablet 2 creates a new Event
Steps:
- ...

## Exploring unexpected sync conflicts

### DiffType: Metadata - Two cases view the same case but make no modification 

A metadata conflict is easy to create: whenever a case is viewed, its metadata is modified. 

Steps:
- launch 2 PWA's with the group, based on the case module - `docker exec tangerine create-group "Test Auto-merge 1" case-module`
- consider editing the "Registration for Role 1" "Registration" section by changing the QR code into an input, just to make testing easier.
- Create a new case with pwa1. Fill out "Registration for Role 1" - enter '0' for "How many participant of type Role 2 would you like to enroll in this case?", submit, and sync.
- in PWA2, sync, and open the new case. Create a New Event of type "An Event with an event form you can delete" . Go into the event and form and submit the "An Event Form you can delete" form. Sync. Notice that so far, no new conflicts have been created.
- In PWA1, sync. Still no conflicts. The new form does not appear either. Do a hard refresh. The new form should now appear in the case. Sync.
- In PWA2, sync. Conflicts arise. Check data/issues on server - should be type (1) DIFF_TYPE__METADATA. Merged: true. There is a 50/50 chance this record won't have a conflict...

### DiffType: EventForm - data conflict 1 - Don't touch the event 
So far, this has not made a conflict for me...

Steps:
- Create a new case with pwa1. Fill out "Registration for Role 1" - enter '0' for "How many participant of type Role 2 would you like to enroll in this case?", submit. On the same case, create a New Event of type "An Event with an event form you can delete". Don't view that event or enter data in its form. Sync. 
- In PWA2, sync. Enter the case you just synced and complete the form in "An Event with an Event Form you can delete." Sync.
- In PWA1, sync. The new form does not appear. Do a hard refresh. The new form should now appear in the case. Sync.
- In PWA2, sync. Conflicts arise. Or not. Check data/issues on server - should be type (1) DIFF_TYPE__METADATA. Merged: true. There is a 50/50 chance this record won't have a conflict...


### DiffType: EventForm - data conflict 2 - Touch the event 
So far, this has not made a conflict for me...

Steps:
- Create a new case with pwa1. Fill out "Registration for Role 1" - enter '0' for "How many participant of type Role 2 would you like to enroll in this case?", submit. On the same case, create a New Event of type "An Event with an event form you can delete". View the event, but don't view the form. Sync. 
- In PWA2, sync. Enter the case you just synced and complete the form in "An Event with an Event Form you can delete." Sync.
- In PWA1, sync. The new form does not appear. Do a hard refresh. The new form should now appear in the case. Sync.
- In PWA2, sync. Conflicts arise. Or not. Check data/issues on server - should be type (1) DIFF_TYPE__METADATA. Merged: true. There is a 50/50 chance this record won't have a conflict...


### DiffType: EventForm - data conflict 3 - Open but don't save the form 

Steps:
- Create a new case with pwa1. Fill out "Registration for Role 1" - enter '0' for "How many participant of type Role 2 would you like to enroll in this case?", submit. On the same case, create a New Event of type "An Event with an event form you can delete". View the event, then view the form, but don't submit it. Sync. 
- In PWA2, sync. Enter the case you just synced and complete the form in "An Event with an Event Form you can delete." Sync.
- In PWA1, sync. The new form does not appear. Do a hard refresh. The new form should now appear in the case. Sync.
- In PWA2, sync. Conflicts arise. Or not. Check data/issues on server - should be type (1) DIFF_TYPE__METADATA. Merged: true. There is a 50/50 chance this record won't have a conflict...
- So far, this has not made a conflict for me...

