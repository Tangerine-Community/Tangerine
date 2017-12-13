require "SecureRandom"

# nested describes run the before block for each parent first
# it's not a before shortcut
describe "groups", :type => :feature do

  before { server_login() }

  it "should have a group button" do expect(page).to have_content "Groups" end
  it "should have an account button" do expect(page).to have_content "Account" end
  it "should have our test group" do expect(page).to have_content "testsweet" end

  describe "accounts screen", :type => :feature do
    before { click_button "Account" }
    it "should have a manage section" do expect(page).to have_content "Manage" end
    it "should have an account section" do expect(page).to have_content "Account" end
    it "should have group join button" do expect(page).to have_content "Join or create a group" end
  end


  describe "robbert's tasks", :type => :feature do

    it "create a new test group" do

      click_button "Account"

      click_button "Join or create a group"

      $test_group = "test_group_#{SecureRandom.uuid.gsub(/\-/,'')}"

      within ".join_confirmation" do
        find("input[placeholder='Group name']").set $test_group 
      end

      click_button "Join Group"

      fill_in 'Please re-enter your password', :with => $settings[:server][:pass]

      click_button "Verify"

      expect(page).to have_content "Group created."
      
    end


    it "remove the new test group" do

      click_button "Account"

      within "li[data-group='#{$test_group}']" do
        click_button "Leave"
      end

      fill_in 'Please re-enter your password', :with => $settings[:server][:pass]

      click_button "Verify"

      # weird alerts kept popping up but I couldn't read them
      # something to do with a bad ajax call with the server
      begin
        a = page.driver.browser.switch_to.alert
        puts "alert text: #{a.text}"
      rescue
      end

      expect(page).to have_content "removed permanently"


      begin
        a = page.driver.browser.switch_to.alert
        puts "alert text: #{a.text}"
      rescue
      end    

    end

  end # of robberts tasks

end
