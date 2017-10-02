def server_login

	ensure_on 'http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html'
	
	within(".login_view") do
		fill_in 'User name', :with => $settings[:server][:user]
		fill_in 'Password',  :with => $settings[:server][:pass]
	end

	click_button 'Login'

end
