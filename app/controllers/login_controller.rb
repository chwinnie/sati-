class LoginController < ApplicationController
	def google_auth
		if user_signed_in?
			redirect_to tasks_path
		end

	end
end
