require "sinatra"

get "/:group" do

	`rspec --format h rspec.rb`

end