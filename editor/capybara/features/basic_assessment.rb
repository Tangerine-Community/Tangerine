require 'rest-client'


describe "basic assessment", :type => :feature do

  before do
    server_login()
    click_button "testsweet"
  end

  it "should run" do

    visit "http://databases.tangerinecentral.org/group-testsweet/_design/ojai/index.html#assessments"

    click_on 'Basic Assessment'
    
    click_on 'Run'


    # GPS 

    expect(page).to have_content "Best reading"
    expect(page).to have_content "Current reading"
    expect(page).to have_content "GPS Status"

    click_on "Next"


    # Date and Time 

    expect(page).to have_content "Date and time"

    fill_in "Year", :with => "1999"
    select "Dec", :from => "Month"
    fill_in "Day", :with => "31"
    fill_in "Time", :with => "00:00"

    click_on "Next"


    # Location

    select "Mars", :from => "Planet"
    select "Olympus Mons", :from => "Mountain"

    click_on "Next"


    # Consent

    expect(page).to have_content "Consent"
    expect(page).to have_content "No"

    click_on "Yes, continue"
    
    click_on "Next"

    
    # Grid

    expect(page).to have_content "Binary"
    expect(page).to have_content "Start"
    expect(page).to have_content "Stop"
    expect(page).to have_content "Restart"
    expect(page).to have_content "Input Mode"
    expect(page).to have_content "Mark"
    expect(page).to have_content "60"
    expect(page).to have_content "Last attempted"

    click_on "Start"

    click_on "0"
    click_on "100"
    
    click_on "Stop"

    click_on "Next"


    # Survey

    click_on 'Option 2'
    click_on 'Option B'

    click_on 'Next'


    # Additional comments

    fill_in "Additional comments optional", :with => "additional comments test"
    
    resultId = evaluate_script "window.vm.currentView.result.id"
    
    click_on "Save result"    

    expect(page).to have_content "Result saved"
    
    csvRow = JSON.parse(RestClient.get( "http://#{$settings[:server][:user]}:#{$settings[:server][:pass]}@databases.tangerinecentral.org/group-testsweet/_design/ojai/_view/csvRows?key=%22#{resultId}%22" ).to_s)['rows'][0]['value']
    value = Hash[csvRow.map { |cell| [cell['key'], cell['value'].to_s ] } ]
    
    expect(value['consent']).to eq('yes')

    expect(value['q1']).to   eq('2')
    expect(value['q2_a']).to eq('0')
    expect(value['q2_b']).to eq('1')
    expect(value['q2_c']).to eq('0')

    expect(value['Planet']).to   eq('Mars')
    expect(value['Mountain']).to eq('Olympus Mons')
    
    expect(value['binary1']).to eq('0')
    expect(value['binary5']).to eq('0')
    
    expect(value['year']).to        eq('1999')
    expect(value['month']).to       eq('12')
    expect(value['date']).to        eq('31')
    expect(value['assess_time']).to eq['00:00']
    
    expect(value['additional_comments']).to eq("additional comments test")

  end

end
