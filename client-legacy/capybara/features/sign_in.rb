
describe "signing in", :type => :feature do

  it "should redirect to login screen" do
    visit 'http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html'
    expect(page).to have_content "User name"
    expect(page).to have_content "Password"
    expect(page).to have_content "Login"
  end

  it "should accept user name and password" do
    server_login()
    expect(page).to have_content "Groups"
  end

  it "should show username of user logged in" do
    server_login()
    expect(page).to have_content $settings[:server][:user]
  end

  it "should log out user and return to login screen" do
    server_login()
    find("#logout").click
    expect(page).to have_content "User name"
    expect(page).to have_content "Password"
    expect(page).to have_content "Login"
  end


end
