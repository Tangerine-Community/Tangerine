require "SecureRandom"

# nested describes run the before block for each parent first
# it's not a before shortcut
describe "Grid Display" do

  it "should have a start button" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "GridRunView.button.start"

  end

  it "should have a stop button" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "GridRunView.button.stop"

  end

  it "should have a timer at 60 seconds" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "60"

  end

  it "should have a input mode selector" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "GridRunView.label.input_mode"

  end

  it "should have a mark mode button" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "GridRunView.button.mark"

  end

  it "should have a last item mode button" do 

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_content "GridRunView.button.last_attempted"

  end

  it "should start with a disabled grid" do

    visit 'http://localhost:8080/fixtures/grid.html'

    expect(page).to have_css "table.disabled"


  end


  it "should show items when the start button is clicked" do

    visit 'http://localhost:8080/fixtures/grid.html'

    click_button "GridRunView.button.start"

    expect(page).not_to have_css "table.disabled"

  end


  it "should start timer when the start button is clicked" do

    visit 'http://localhost:8080/fixtures/grid.html'

    click_button "GridRunView.button.start"

    sleep 1

    expect(page).to have_content "59"

  end

  it "should allow items to be marked as wrong" do

    visit 'http://localhost:8080/fixtures/grid.html'

    click_button "GridRunView.button.start"

    expect(page).not_to have_css "table.disabled"

  end


  it "should place bracket at last item when timer stopped" do

    visit 'http://localhost:8080/fixtures/grid.html'

    click_button "GridRunView.button.start"

    click_button "GridRunView.button.stop"

    expect(page).to have_css "button.element_last[data-label='z']"

  end


  it "mode selector does nothing before timer starts" do

    visit 'http://localhost:8080/fixtures/grid.html'

    click_button "GridRunView.button.mark"

    expect(page).not_to have_css "#mark_view1.ui-state-active"

  end


end
  
=begin

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
=end
