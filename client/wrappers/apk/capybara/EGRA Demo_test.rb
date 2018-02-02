# to install:  install ruby from rubyinstaller.org
# select global path option, (tick options 2 & 3)
# open cmd;  gem install --no-rdoc --no-ri selenium-webdriver capybara
# install chromedriver (NOT chromedriver2!!) from:
# https://code.google.com/p/chromedriver/downloads/detail?name=chromedriver_win_26.0.1383.0.zip&can=2&q=
# copy chromedriver.exe into C:\Ruby193\bin directory

# Capybara is a language for controlling your web browser
# The documentation for Capybara is here: https://github.com/jnicklas/capybara#the-dsl


require 'rubygems'
#require 'selenium-webdriver'
require "selenium/webdriver"
require 'capybara'
require 'capybara/dsl'


Capybara.register_driver :selenium do |app|
 profile = Selenium::WebDriver::Chrome::Profile.new
 profile["download.default_directory"] = DownloadHelpers::PATH.to_s
 Capybara::Selenium::Driver.new(app, :browser => :chrome, :profile => profile)
end

Capybara.default_driver = Capybara.javascript_driver = :chrome


Capybara.run_server = false
Capybara.current_driver = :selenium

include Capybara::DSL

#
# This section is for common actions that can be reused
#
#
def login
  visit("http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html")
  fill_in('User name', :with => 'tangerine')
  fill_in('Password', :with => 'tangytangerine')
  click_button('Login')
  # Checking for content causes the browser to wait until it's there
  has_content?("Groups")
end

def local_login
  visit("http://localhost:5984/tangerine/_design/ojai/index.html")
  fill_in('User name', :with => 'admin')
  fill_in('Password', :with => 'password')
  click_button('Login')
end

def visit_group(group_name)
  # Note that #{} is how you insert a variable into a string
  visit("http://databases.tangerinecentral.org/group-#{group_name}/_design/ojai/index.html#assessments")
  has_content?("Assessments")
end


def run_assessment(assessment_name)
  # Executes javascript on the page
  # I could've done this with capybara functions but it was really slow
  # find a span element that contains the text [assessment_name] and click on it
  page.execute_script("$('span:contains(#{assessment_name})').click()")

  # find an image element with the class run that is visible and click on it
  page.execute_script("$('img.run:visible').click()")
end

def click_with_javascript(css_selector)
 page.execute_script("$('#{css_selector}').click()")
end


def home_location
#Completes the Home Location instrument
has_content? ("Home Location")
fill_in('Region', :with => 'Practice')
  fill_in('District', :with => 'District')
	fill_in('Village', :with => 'Village')
end

def child_information
has_content? "How old are you?"
click_with_javascript("#question-age div[data-value=15]")
has_content? "What grade are you in"
click_with_javascript("#question-grade div[data-value=5]")
has_content? "Is the participant a girl?"
click_with_javascript("#question-girl div[data-value=1]")
click_button "Next"
end

def grid_question
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=4]")
click_button "Next"
end

def grid_autostop
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=1]")
click_with_javascript ("#prototype_wrapper div[data-index=2]")
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=3]")
end


def reading_comprehension
click_with_javascript ("#question-read_comp1 div[data-value=0]")
click_with_javascript ("#question-read_comp2 div[data-value=0]")
click_with_javascript ("#question-read_comp3 div[data-value=0]")
click_with_javascript ("#question-read_comp4 div[data-value=0]")
click_with_javascript ("#question-read_comp5 div[data-value=0]")
click_button "Next"
end

# 
#
# This section is where the actual steps happen
#


#local_login
#sleep 1
login
visit_group "blah"

#Accessing results dashboard
click_button "Results"
#this puts the most recent result at the top
page.execute_script("$('.20130617').first().click()")
#this select the most recent value
page.execute_script("$('.sort-value').first().click()")
#could check here for items like number of subtests, tangerine version, names of subtests, etc. 
#this pulls up the assessment results
page.execute_script("$('.result:visible').click()")


has_content? "Assessments"
run_assessment "EGRA_demo" 
has_content? "Date and Time"
click_button "Next"

#test clear button on school location subtest
home_location
click_button "Clear"
home_location
click_button "Next"

#checks if generate works, checks if a pupil id with numbers is possible
has_content? "Child ID"
fill_in('participant_id', :with => 'ABCEG5')
click_button "Next"
has_no_content? "Consent"
click_button "Generate" 
click_button "Next" 

#check if "no" to consent terminates assessment
has_content? "Does the child consent?"
click_with_javascript("#consent_no")
click_button "Confirm"
has_content? "Assessment complete" 
page.execute_script("$('#corner_logo').click()")

#doing various grid question tests
has_content? "Assessments"
run_assessment "EGRA_demo" 
has_content? "Date and Time"
click_button "Next"
home_location
click_button "Next"
has_content? "Child ID"
click_button "Generate" 
click_button "Next" 
has_content? "Does the child consent?"
click_with_javascript("#consent_yes")
click_button "Next" 
child_information
has_content? "EGRA 1: Letter Sound Identification"

#check if you can move on without hitting "last item attempted"
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_button "Next" 
has_no_content? "EGRA 2: Non-word Reading"
click_with_javascript ("#prototype_wrapper div[data-index=4]")
click_button "Next" 


#check if you can click a "last item attempted" prior to last item marked incorrect
has_content? "EGRA 2: Non-word Reading"
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=3]")
click_button "Next" 
has_no_content? "EGRA 3a: Oral Passage Reading"
click_with_javascript ("#prototype_wrapper div[data-index=4]")
click_button "Next"

#test Restart button, re-run test
has_content? "EGRA 3a: Oral Passage Reading"
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=4]")
click_button "Restart"
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=4]")
sleep 1

#checking correct functionality of input mode after test has run (clicks on "Mark" but not clicking on any of the buttons after that)
#Validate the asterisk "mark entire row"
page.execute_script("$('span:contains(Mark)').click()")
sleep 1
page.execute_script("$('#prototype_wrapper div[data-index=2]').click()")
page.execute_script("$('#prototype_wrapper div[data-index=2]').click()")
sleep 5
click_with_javascript ("#prototype_wrapper div[data-index=3]")
sleep 5
page.execute_script("$('span:contains(Last attempted)').click()")
sleep 5
click_with_javascript ("#prototype_wrapper div[data-index=5]")
sleep 5
page.execute_script("$('#prototype_wrapper div[data-index=15]').click()")
click_button "Next"


#test skip logic, this test moves through perfectly if skip logic works, if it doesn't it will return an error (all specific types of skip logic)
run_assessment "Button test"
has_content? "Previous"
page.execute_script('$("#question-teacher_like div[data-value=0]").click()')
page.execute_script('$("#question-school_like div[data-value=1]").click()')
click_button "Next"
has_content? "All button stuff"
sleep 1
page.execute_script('$("#question-q1 div[data-value=1]").click()')
click_button "Next Question"
page.execute_script('$("#question-q2 div[data-value=0]").click()')
click_button "Next Question"
has_content? "What kind of pet do you have?"
fill_in('view79_q3', :with => 'dog')
click_button "Next Question"
has_content? "What is your favorite icecream?"
page.execute_script('$("#question-q7 div[data-value=0]").click()')
click_button "Next Question"
has_content? "test"
page.execute_script('$("#question-testcase div[data-value=0]").click()')
click_button "Next"
has_content? "Question_copy"
page.execute_script("$('#corner_logo').click()")


#testing if questions can be copied to other assessments, able to select value from dropbox menu but unable to actually go to the link
#has_content? "Assessments"
#page.execute_script("$('span:contains(Button test)').click()")
#page.execute_script("$('img.edit:visible').click()")
#has_content? "Assessment Builder"
#page.execute_script("$('img.icon_edit').click()")
#has_content? "Subtest Editor"
#page.execute_script("$('img.show_copy').first().click()")
#has_content? "Copy to"
#sleep 2
#$('.copy_select').val("Question_copy").click()
#select('Question_copy', :from => 'Select a subtest')
#sleep 5
#has_content? "Question_copy"
#page.execute_script("$('.delete').click()")
#click_button "Delete"
#sleep 5
#page.execute_script("$('#logout_link').click()")



#dynamic question prompts, will show error for has_content? "What is the age of Nicky" if not working
has_content? "Assessments"
run_assessment "Dynamics Questions and Custom Validation"
has_content? "Dynamic Question"
fill_in('view38_name', :with => 'Nicky')
click_button "Next Question"
has_content? "What is the age of Nicky"


#testing custom validation, if not working will show error for has_no_content? "Assessment Complete"
fill_in('view39_age', :with => '100')
click_button "Next"
has_no_content? "Abort_Resume"
has_content? "Enter a number between 1 and 49"
fill_in('view39_age', :with => '12')
click_button "Next"
has_content? "Abort_Resume"


#abort and resume w/o randomization
page.execute_script("$('#logout_link').click()")
sleep 1
fill_in('User name', :with => 'tangerine')
  fill_in('Password', :with => 'tangytangerine')
  click_button('Login')
has_content? "Groups"
visit_group "blah"
page.execute_script("$('span:contains(Dynamics Questions and Custom Validation)').click()")
find('img.results').click()
has_content? "Save options"
sleep 1
page.execute_script("$('.details').first().click()")
has_content? "Not finished"
click_button "Resume"
sleep 2
page.execute_script('$("button.start_time").click()')
click_with_javascript ("#prototype_wrapper div[data-index=3]")
sleep 1
click_button "Stop"
sleep 1
click_with_javascript ("#prototype_wrapper div[data-index=3]")
click_button "Next"
has_content? "Assessment complete"


#testing if a subtest can be copied to another instrument
page.execute_script("$('#corner_logo').click()")
has_content? "Assessments"
page.execute_script("$('span:contains(Button test)').click()")
page.execute_script("$('img.edit:visible').click()")
has_content? "Assessment Builder"
page.execute_script("$('img.icon_copy').first().click()")
click_button "Copy"
has_content? "Assessment Builder"
sleep 1
page.execute_script("$('img.icon_delete').click()")
click_button "Delete"

#duplicating an assessment
page.execute_script("$('#corner_logo').click()")
page.execute_script("$('span:contains(simple test ( server ))').click()")
page.execute_script("$('img.duplicate:visible').click()")
has_content? "Copy of simple test ( server )"
page.execute_script("$('span:contains(Copy of simple test ( server ))').click()")
page.execute_script("$('img.assessment_delete:visible').click()")
page.execute_script('$("button.assessment_delete_yes:visible").click()')





run_assessment "simple test ( server )"


#this checks if you can skip subtest without entering data (both if the skip button is there when it's not supposed to be and if you are able to click next without entering data)
click_button "Next"
has_no_button? "Skip"
home_location
click_button "Next"

#this checks autostop, returns error if not working
has_content? "words"
grid_autostop
grid_question
click_button "Next"


has_content?("Multiple skip test (not)")
sleep 1
page.execute_script('$("#question-testcase div[data-value=0]").click()')
click_button "Next"

#if AOD - skipping entire subtests isn't working, the program will stop here on Student Information. If fine, it will simply skip over the subtest


#Testing that reading comprehension questions are properly linked to how far the student has read
has_content? "EGRA 3a: Oral Passage Reading"
grid_question
sleep 1
has_no_content? "EGRA 3b: Reading Comprehension"


#testing survey early stop logic, will show error message if not working for has_content? "Assessment complete"
page.execute_script("$('#corner_logo').click()")
has_content? "Assessments"
run_assessment "earlyabort_test"
has_content? "Student_Information"
click_with_javascript("#question-Gender div[data-value=1]")
click_button "Next Question"
has_content? "Assessment complete"


#run through an EGRA assessment

page.execute_script("$('#corner_logo').click()")
has_content? "Assessments"
run_assessment "EGRA_demo" 
has_content? "Date and Time"
click_button "Next"
home_location
click_button "Next"
has_content? "Child ID"
click_button "Generate" 
click_button "Next" 
has_content? "Does the child consent?"
click_with_javascript("#consent_yes")
click_button "Next" 
child_information
has_content? "EGRA 1: Letter Sound Identification"
grid_question
has_content? "EGRA 2: Non-word Reading"
grid_question
has_content? "EGRA 3a: Oral Passage Reading"
grid_question
has_content? "EGRA 3b: Reading Comprehension"
sleep 1
reading_comprehension

sleep 8


#download CSV file
page.execute_script("$('span:contains(Abort_Resume with Randomization)').click()")
find('img.results').click()
click_button "CSV (beta)"
#need to specify where this file goes so that seperate check can be run on it

#Using text editor, bold, changing size, etc. (having problems inserting information into text editor)
page.execute_script("$('span:contains(Abort_Resume with Randomization)').click()")
find('img.edit').click()
has_content? "Assessment Builder"
page.execute_script("$('.icon_edit').first().click()")
#click_button "Edit"
sleep 2
page.execute_script("$('.richtext_edit').first().click()")
sleep 3
page.execute_script("$('.cke').html('Hi my name is Nicky')")
click_button "Save"
sleep 4
#clicks bold button
#$('#cke_15_label').click()
#clicks font box, now just select font you would like
#$('#cke_34_text').click()


#abort and resume w/randomization (also tests if randomization is actually working)
#isn't working at the moment may be a problem with randomization not working in Tangerine
run_assessment "Abort_Resume with Randomization"
has_content? "Dynamic Question"
fill_in('view49_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question1"
fill_in('view58_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question3"
page.execute_script("$('#logout_link').click()")
sleep 1
fill_in('User name', :with => 'tangerine')
fill_in('Password', :with => 'tangytangerine')
click_button('Login')
has_content? "Groups"
visit_group "blah"
page.execute_script("$('span:contains(Abort_Resume with Randomization)').click()")
find('img.results').click()
has_content? "Save options"
sleep 1
page.execute_script("$('.details').first().click()")
has_content? "Not finished"
click_button "Resume"
has_content? "Dynamic Questions2"
fill_in('view67_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question2"
fill_in('view76_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question4"
fill_in('view85_name', :with => 'Nicky')
click_button "Next"
has_content? "Assessment Complete"
click_button "Save result"
click_button "Perform another assessment"
has_content? "Dynamic Question"
fill_in('view109_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question1"
fill_in('view118_name', :with => 'Nicky')
click_button "Next"
has_content? "Dynamic Question2"
fill_in('view127_name', :with => 'Nicky')
click_button "Next"
page.execute_script("$('#logout_link').click()")
sleep 1
fill_in('User name', :with => 'tangerine')
  fill_in('Password', :with => 'tangytangerine')
  click_button('Login')
has_content? "Groups"
visit_group "blah"
page.execute_script("$('span:contains(Abort_Resume with Randomization)').click()")
find('img.results').click()
has_content? "Save options"
sleep 1
page.execute_script("$('.details').first().click()")
has_content? "Not finished"
click_button "Resume"
has_content? "Dynamic Question3"
fill_in('view66_name', :with => 'Nicky')
sleep 5
click_button "Next"
has_content? "Dynamic Question4"
fill_in('view75_name', :with => 'Nicky')
click_button "Next"
has_content? "Assessment Complete"
