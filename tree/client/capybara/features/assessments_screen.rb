describe "assessment screen", :type => :feature do

  before do
    server_login()
  end

  it "should show test group" do expect(page).to have_content "testsweet" end

  describe "testsweet group", :type => :feature do

    before { click_button "testsweet" }

    it "should have a groups button" do expect(page).to have_content "Groups" end
    it "should have an APK button" do expect(page).to have_content "APK" end
    it "should have a results button" do expect(page).to have_content "Results" end
    it "should have an assessments section" do expect(page).to have_content "Assessments" end
    it "should have a users section" do expect(page).to have_content "Users" end

  end

end