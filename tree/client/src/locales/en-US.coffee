Tangerine.locales["en-US"] =
  translation :
    "Tangerine" :
      "message" :
        "save_error" : "Save error"
        "saved"      : "Saved"
      "navigation" :
        "button" :
          "back" : "Back"
      "actions" :
        "button" :
          "save" : "Save"
    "TabletManagerView" :
      "message" :
        "found" : "__count__ tablets found."
        "detecting" : "Please wait, detecting tablets..."
        "searching" : "Searching. __percentage__% complete."
        "confirm_pull" : "Confirm __found__ tablets found. Start data pull?"
        "pull_status" : "Pulling from __tabletCount__ tablets."
        "pull_complete" : "Pull finished. <br>__successful__ out of __total__ successful."
        "syncing" : "Syncing: <br>__done__ out of __total__."
        "successful_count" : "__successful__ out of  __total__ succesful."
      "label" :
        "sync_complete" : "Sync Complete"

    "ResultsView" :
      "label" :
        "save_options" : "Save options"
        "advanced" : "Advanced"
        "pagination" : "__start__-__end__ of __total__"
        "cloud" : "Cloud"
        "csv" : "CSV"
        "tablets" : "Tablets"
        "status" : "Status"
        "started" : "Started"
        "results" : "Results"
        "details" : "Details"
        "page" : "Page"
        "per_page" : "per page"
      "button" :
        "refresh" : "Refresh"
        "detect"  : "Detect options"

    "ResultSumView" :
      "button" :
        "resume" : "Resume"
      "message" :
        "no_results" : "No results yet!"

    "SettingsView" :
      "message" :
        "warning" : "Please be careful with the following settings."
      "help" :
        "context" : "Sets the general behavior and appearance of Tangerine. Do not change this setting."
        "language" : "Contact a Tangerine admin for more information on what languages are currently available."
        "group_handle" : "A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality."
        "group_name" : "The group connected to this instance of Tangerine, and any APKs made from this instance."
        "group_host" : "The URL of the server."
        "upload_password" : "The password for uploading to your group."
        "log_events" : "app, ui, db, err"
      "label" :
        "settings" : "Settings"
        "context" : "Context"
        "language" : "Language"
        "group_handle" : "Group handle"
        "group_name" : "Group name"
        "group_host" : "Group host"
        "upload_password" : "Upload password"
        "log_events" : "Log events"

    "ResultView" :
      "label" :
        "assessment_complete" : "Assessment complete"
        "comments" : "Additional comments (optional)"
        "subtests_completed" : "Subtests completed"
      "message" :
        "saved" : "Result saved"
        "not_saved" : "Not saved yet"
      "button" :
        "save" : "Save result"
        "another" : "Perform another assessment"


    "AssessmentMenuView" :
      "button" :
        "new" : "New"
        "import" : "Import"
        "apk" : "APK"
        "groups" : "Groups"
        "universal_upload" : "Universal Upload"
        "sync_tablets" : "Sync tablets"
        "results" : "Results"
        "save" : "Save"
        "cancel" : "Cancel"
      "label" :
        "assessment" : "Assessment"
        "assessments" : "Assessments"
        "curriculum" : "Curriculum"

    "GridRunView" :
      "label" :
        "input_mode"      : "Input Mode"
        "was_autostopped" : "Was autostopped"
        "time_remaining"  : "Time remaining"
      "message" :
        "touch_last_item"      : "Please touch last item read."
        "time_still_running"   : "Time still running."
        "subtest_not_complete" : "Subtest not complete."
        "autostop"             : "Autostop activated. Discontinue test."
        "autostop_cancel"      : "Autostop removed. Continue."
        "last_item_confirm"    : "Was the last item \"__item__\"?\nOk to confirm. Cancel to place bracket."
      "button" :
        "restart"         : "Restart"
        "start"           : "Start"
        "stop"            : "Stop"
        "mark"            : "Mark"
        "last_attempted"  : "Last attempted"
        "item_at_seconds" : "Item at __seconds__ seconds"

    "SubtestRunView" :
      "button" :
        "help" : "Help"
        "skip" : "Skip"
        "next" : "Next"
        "back" : "Back"

    "DatetimeRunView" :
      "label" :
        "year" : "Year"
        "month" : "Month"
        "day" : "Day"
        "time" : "Time"

    "ConsentRunView" :
      "label" :
        "default_consent_prompt" : "Does the child consent?"
        "confirm_nonconsent" : "Click to confirm consent not obtained."
      "button" :
        "confirm" : "Confirm"
        "yes_continue" : "Yes, continue"
        "no_stop" : "No, stop"
      "message" :
        "confirm" : "Please confirm."
        "select" : "Please select one."

    "IdRunView" :
      "label" :
        "identifier" : "Random identifier"
      "button" :
        "generate" : "Generate"
    "LocationRunView" :
      "button" :
        "clear" : "Clear"
      "message" :
        "must_be_filled" : "__levelName__ must be filled."
        "please_select" : "Please select a(n) __levelName__"
    "SurveyRunView" :
      "button" :
        "next_question" : "Next question"
        "previous_question" : "Previous question"
      "message" :
        "please_answer" : "Please answer this question."
        "not_enough" : "Student did not read enough words to ask comprehension questions."
        "correct_errors" : "Please correct the errors on this page."
    "NavigationView" :
      "label" :
        "teacher"    : "Teacher"
        "user"       : "User"
        "enumerator" : "Enumerator"
        "student_id" : "Student ID"
        "version"    : "Version"
      "button" :
        "logout" : "Logout"
        "account" : "Account"
        "settings" : "Settings"
      "help" :
        "logo" : "Go to main screen."
        "account" : "Go to account screen."
      "message" :
        "incomplete_main_screen" : "Assessment not finished. Continue to main screen?"
        "incomplete_logout" : "Assessment not finished. Continue to logout?"
        "logout_confirm" : "Are you sure you want to logout?"
    "LoginView" :
      "message" :
        "error_password_incorrect" : "Incorrect password."
        "error_password_empty" : "Please enter a password."
        "error_name_empty" : "Please enter a name."
        "error_name_taken" : "Name already taken."
        "pass_mismatch" : "Passwords do not match"
      "button" :
        "sign_up" : "Sign up"
        "login" : "Login"
        "logout" : "Logout"
      "label" :
        "login" : "Login"
        "sign_up" : "Sign up"
        "teacher" : "Teacher name"
        "user"    : "User name"
        "enumerator" : "Enumerator name"
        "password" : "Password"
        "password_confirm" : "Confirm Password"


    "QuestionsEditListElementView" :
      "help" :
        "copy_to" : "Copy to"
        "delete" : "Delete"
        "edit"   : "Edit"
      "button" :
        "delete" : "Delete"
        "cancel" : "Cancel"
      "label" :
        "delete_confirm" : "Delete?"
        "loading" : "Loading..."
        "select" : "Select a subtest"
    "GpsRunView" :
      "button" :
        "clear" : "Clear"
      "label" :
        "good" : "Good"
        "ok" : "Ok"
        "poor" : "Poor"
        "meters" : "meters"
        "latitude" : "Latitude"
        "longitude" : "Longitude"
        "accuracy" : "Accuracy"
        "gps_status" : "GPS Status"
        "best_reading" : "Best reading"
        "current_reading" : "Current reading"
      "message" :
        "gps_ok" : "GPS signal ok."
        "attempt" : "Attempt #__count__"
        "retrying" : "Retrying..."
        "searching" : "Searching..."
        "not_supported" : "Your system does not support geolocations."
