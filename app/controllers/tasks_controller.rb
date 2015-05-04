class TasksController < ApplicationController
	# require 'net/http'
	
# task :list_labels => :environment do
#   client = Google::APIClient.new
#   client.authorization.access_token = Token.last.fresh_token
#   service = client.discovered_api('gmail')
#   result = client.execute(
#     :api_method => service.users.labels.list,
#     :parameters => {'userId' => 'me'},
#     :headers => {'Content-Type' => 'application/json'})
#   pp JSON.parse(result.body)
# end

	def index
		if (current_user.token.expired?)
			current_user.token.refresh!
		end

		client = Google::APIClient.new
		client.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		
		client.authorization.access_token = current_user.token.access_token

		tasks = client.discovered_api('tasks')
		result = client.execute(
        :api_method => tasks.tasklists.list)
  		@tasklists = JSON.parse(result.body)["items"]

		client2 = Google::APIClient.new
		client2.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client2.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		client2.authorization.access_token = current_user.token.access_token

		calendar = client2.discovered_api('calendar', 'v3')
		calendar_list_result = client2.execute(
        :api_method => calendar.calendar_list.list)
  		@calendars = JSON.parse(calendar_list_result.body)["items"]
  		@testing = JSON.parse(calendar_list_result.body)
  		@event_title = "MEOW"

  		#Time.now.utc.iso8601
  		result = client2.execute(
        :api_method => calendar.events.list,
        :parameters => {calendarId: 'a3br144mi7v8b3a3g9kaor2j7k@group.calendar.google.com', timeMin: Time.now.utc.iso8601})
        @events = JSON.parse(result.body)["items"]

        @events.each do |event|
			@summary = event["summary"]
			@start = event["start"]["dateTime"]
			@start = @start.slice(0...-7)
			@end = event["end"]["dateTime"]
		end


	end
end
