
describe "csv downloading", :type => :feature do

  it "should download csv on button click" do
    server_login()
    click_on "testsweet"
    click_on "Basic Assessment"
    click_link "Results"
    click_link "CSV"
    
  end

end
