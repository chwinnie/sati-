
$(document).ready(function() {
	//gon.all_events
	//gon.all_tasks

	var events_list = [];
	var tasks_time_estimates = {};

	var refreshCalendarEvents = function refreshCalendarEvents() {
		//remove curr calendar
		$('#calendar').remove();
		$('.calendar_row').append('<div id="calendar" style="display:block"></div>');

		var currTime = moment().minutes(0).seconds(0).format('HH:mm:ss');

		var currDate = moment().hours(0).minutes(0).seconds(0).format();
		console.log(currDate);

		//reload calendar
		$('#calendar').fullCalendar({
			header: false,
			height: "auto",
			minTime: currTime,
			defaultView: 'agendaDay',	
			defaultDate: currDate,
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			events: events_list
		});	
	}.bind(this);

	var implementSelectionUI = function implementSelectionUI($obj) {
		var currBgColor = $obj.css('background-color');
		var cssBlue = 'rgb(0, 0, 255)';
		if (currBgColor === cssBlue) {
			$obj.css('background-color', 'white');
			return false;
		} else {
			$obj.css('background-color', 'blue');
			return true;
		}
	};

	var updateEvent = function updateEvent(event_id, time_to_add) {
		var eventIndexToUpdate;
		var oldEventData;

		$.each(events_list, function(i, val) {
			if (val.id === event_id) {
				console.log('found event!');
				eventIndexToUpdate = i;
				oldEventData = val;
			}	
		});

		var currEndTime = moment(oldEventData['end']);
		oldEventData['end'] = moment().add(time_to_add, 'hours').format();
		events_list[eventIndexToUpdate] = oldEventData;

		refreshCalendarEvents();
		
	}

	var displayTasksForTimeEstimates = function displayTasksForTimeEstimates(tasksToDisplay) {

		$.each(tasksToDisplay, function(key, val) {
			var task_title = val.title;
			var task_id = val.id;

			$('.task_times_list').append('<tr><td>' + task_title + '</td><td><input type="numeric" class="task_time_estimate" id='+task_id+'></td></tr>')
		});

		$('.task_time_estimate').keyup(function() {
			var new_task_time_estimate = $(this).val();
			var task_id = this.id;
			tasks_time_estimates[task_id] = new_task_time_estimate;

			var time_to_add = $('#'+task_id).val();

			$.each(tasksToDisplay, function(key, val) {
				if (val.id === task_id) {
					console.log('ENTERED');
					var taskTimeEstimate = tasks_time_estimates[val.id];
					
					updateEvent(task_id, time_to_add); 
				}
			}.bind(this));
		});
	};

	$('.tasklists_list tr').click(function() {
		var isSelection = implementSelectionUI($(this));

		if (isSelection) {
			var tasksToDisplay = gon.all_tasks[this.id];

			displayTasksForTimeEstimates(tasksToDisplay);

			$.each(tasksToDisplay, function(key, val) {
				var taskTimeEstimate = tasks_time_estimates[val.id];
				var startTime = moment().format();
				var endTime = moment().add(1, 'hour').format();

				console.log(endTime);
				
				var event = {
					id: val.id,
					title: val.title,
					start: startTime,
					end: endTime
				}
				
				events_list.push(event);
			});
			

			refreshCalendarEvents();

		}
		

	});

	$('.calendars_list tr').click(function() {
		var isSelection = implementSelectionUI($(this));

		if (isSelection) {
			var eventsToDisplay = gon.all_events[this.id];

			$.each(eventsToDisplay, function(key, val) {
				
				var event = {
					title: val.title,
					start: val.start.dateTime,
					end: val.end.dateTime
				}
				
				events_list.push(event);

			refreshCalendarEvents();

			});
		}

	});
	
	refreshCalendarEvents();	

});
