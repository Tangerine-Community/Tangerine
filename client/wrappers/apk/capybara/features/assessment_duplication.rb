
describe "assessment duplication", :type => :feature do

  before do
    server_login()
  end

  it "should duplicate new assessment" do

    click_button "testsweet"

    # create new assessment
    duplication_test = "duplication test #{SecureRandom.uuid.gsub(/\-/,'')}"

    expect(page).to have_content "New"
    click_on "New"
    fill_in 'Name', :with => duplication_test
    click_on "Save"

    # test duplication
    expect(page).to have_content duplication_test
    click_on duplication_test
    click_on "Duplicate"

    # assert
    expect(page).to have_content "Copy of #{duplication_test}"

    # delete assessment

    visit "http://databases.tangerinecentral.org/group-testsweet/_design/ojai/index.html#assessments"
    expect(page).to have_content "Copy of #{duplication_test}"
    click_on "Copy of #{duplication_test}"
    click_on "Assessment Delete"
    click_on "Delete"

    expect(page).to have_content duplication_test
    click_on duplication_test
    click_on "Assessment Delete"
    click_on "Delete"


  end

  it "should duplicate an assessment with subtests" do

    click_button "testsweet"

    # create new assessment

    duplication_test = "duplication test #{SecureRandom.uuid.gsub(/\-/,'')}"
    click_on "New"
    fill_in 'Name', :with => duplication_test
    click_on "Save"

    # edit assessment
    expect(page).to have_content duplication_test
    click_on duplication_test
    click_on "Edit"

    # add subtests
    for x in 1..3
      expect(page).to have_content "Add Subtest"
      click_on "Add Subtest"
      within ".new_subtest_form" do
        page.select "Date and Time", :from => "Type"
        fill_in 'Name', :with => "Test Subtest #{x}"
      end
      click_on "Add"
    end

    click_on "Back"

    # duplicate the assessment
    expect(page).to have_content duplication_test
    click_on duplication_test
    click_on "Duplicate"

    # edit the assessment to check
    expect(page).to have_content "Copy of #{duplication_test}"
    click_on "Copy of #{duplication_test}"
    click_on "Edit"

    # assert subtests also duplicated
    for x in 1..3
      expect(page).to have_content "Test Subtest #{x}"
    end

    visit "http://databases.tangerinecentral.org/group-testsweet/_design/ojai/index.html#assessments"

    # delete assessment
    expect(page).to have_content "Copy of #{duplication_test}"
    click_on "Copy of #{duplication_test}"
    click_on "Assessment Delete"
    click_on "Delete"

    expect(page).to have_content duplication_test
    click_on duplication_test
    click_on "Assessment Delete"
    click_on "Delete"

  end

end