module TasksHelper
	def get_tasklists_from_google
		client = Google::APIClient.new
		client.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		
		client.authorization.access_token = current_user.token.access_token

		tasks = client.discovered_api('tasks')
		result = client.execute(:api_method => tasks.tasklists.list)
  		@tasklists = JSON.parse(result.body)["items"]

		@tasklists
	end

	def get_calendars_from_google
		client = Google::APIClient.new
		client.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		client.authorization.access_token = current_user.token.access_token

		calendar = client.discovered_api('calendar', 'v3')
		calendar_list_result = client.execute(
        :api_method => calendar.calendar_list.list)
  		@calendars = JSON.parse(calendar_list_result.body)["items"]

  		return @calendars
	end

	def get_tasks_from_google(tasklists)
		client = Google::APIClient.new
		client.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		
		client.authorization.access_token = current_user.token.access_token

		tasks_service = client.discovered_api('tasks')

		@all_tasks = {}

		tasklists.each do |tasklist| 
			tasklist_id = tasklist["id"]

			#get only events from calendar
			result = client.execute(
	        :api_method => tasks_service.tasks.list,
	        :parameters => { tasklist: tasklist_id })

	        tasks = JSON.parse(result.body)["items"]

	        puts "Hello"
	        puts tasks.class

	        @all_tasks[tasklist_id] = tasks
	        
	    end

	    @all_tasks
	end

	def get_events_from_google(calendars)

		client = Google::APIClient.new
		client.authorization.client_id = ENV["GOOGLE_CLIENT_ID"]
		client.authorization.client_secret = ENV["GOOGLE_CLIENT_SECRET"]
		
		client.authorization.access_token = current_user.token.access_token

		calendar_service = client.discovered_api('calendar', 'v3')

		@all_events = {}

		calendars.each do |calendar| 
			calendar_id = calendar["id"]

			#get only events from calendar
			result = client.execute(
	        :api_method => calendar_service.events.list,
	        :parameters => { calendarId: calendar_id, 
	        				 timeMin: Time.now.utc.iso8601,
	        				 timeMax: (DateTime.now.midnight + 1.day - 1.second).utc.iso8601})

	        events = JSON.parse(result.body)["items"]

	        @all_events[calendar_id] = events
	        
	    end

	    @all_events
	end

	
		
end
