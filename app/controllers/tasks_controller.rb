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


		@tasklists = view_context.get_tasklists_from_google
		@calendars = view_context.get_calendars_events_from_google

  		@all_tasks = view_context.get_tasks_from_google(@tasklists)
  		@all_events = view_context.get_events_from_google(@calendars)

  		gon.all_tasks = @all_tasks
  		gon.all_events = @all_events


  		# @testing = JSON.parse(calendar_list_result.body)
  		# @event_title = "MEOW"

  		#Time.now.utc.iso8601
  # 		result = client2.execute(
  #       :api_method => calendar.events.list,
  #       :parameters => {calendarId: 'a3br144mi7v8b3a3g9kaor2j7k@group.calendar.google.com', timeMin: Time.now.utc.iso8601})
  #       @events = JSON.parse(result.body)["items"]

  #       @events.each do |event|
		# 	@summary = event["summary"]
		# 	@start = event["start"]["dateTime"]
		# 	@start = @start.slice(0...-7)
		# 	@end = event["end"]["dateTime"]
		# end


	end
end
