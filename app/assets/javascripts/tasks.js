
$(document).ready(function() {
	//gon.all_events
	//gon.all_tasks

	var events_list = [];
	var eventsToDisplay = [];
	var tasks_time_estimates = {};
	var MAX_DATE = moment().add(50, 'years'); //set as 50 years in future

	tasks_list = [
		{id: 13413, title: 'task 1', startTime: moment().format(), endTime: moment().add(1, 'hour').format(), dueDate: moment('5/6/2015')},
		{id: 13413, title: 'task 2', startTime: moment().format(), endTime: moment().add(1, 'hour').format(), dueDate: moment('5/5/2015')},
		{id: 13413, title: 'task 3', startTime: moment().format(), endTime: moment().add(1, 'hour').format(), dueDate: moment('8/5/2015')}
	];

	var refreshCalendarEvents = function refreshCalendarEvents() {
		console.log('refreshCalendarEvents');
		console.log(eventsToDisplay);
		//remove curr calendar
		$('#calendar').remove();
		$('.calendar_row').append('<div id="calendar" style="display:block"></div>');

		var currTime = moment().minutes(0).seconds(0);
		var currDate = moment().hours(0).minutes(0).seconds(0);
		// console.log(currDate);

		//reload calendar
		$('#calendar').fullCalendar({
			header: false,
			height: "auto",
			minTime: currTime.format('HH:mm:ss'),
			defaultView: 'agendaDay',	
			defaultDate: currDate.format(),
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			events: eventsToDisplay
		});	
	}.bind(this);

	var implementSelectionUI = function implementSelectionUI($obj) {
		$('#task-time-estimates-instructions').css('visibility', 'visible');

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

	var updateEventDuration = function updateEventDuration(event_id, time_to_add) {
		var eventIndexToUpdate;
		var oldEventData;

		$.each(events_list, function(i, val) {
			if (val.id === event_id) {
				eventIndexToUpdate = i;
				currEventData = val;
			}	
		});

		currEventData['duration'] = time_to_add;

		events_list[eventIndexToUpdate] = currEventData;


		
		
	};

	var calculateOptimalSchedule = function calculateOptimalSchedule() {
		console.log('calculateOptimalSchedule');

		//sort events_list by dueDate, assume dueDates are Moments
		events_list.sort(function(t1, t2) {
			dueDate1 = t1.due;
			dueDate2 = t2.due;
			return dueDate1.diff(dueDate2);
		});

		free_time_blocks = [ 
			{start: moment(), end: moment().add(2, 'hours'), duration: 2},
			{start: moment().add(3, 'hours'), end: moment().add(4, 'hours'), duration: 1},
			{start: moment().add(7, 'hours'), end: moment().add(10, 'hours'), duration: 3}
		];

		//clear events to schedule
		var eventsLeftToSchedule = events_list;
		// console.log(events_list);
		console.log(eventsLeftToSchedule);
		eventsToDisplay = [];

		for (i = 0; i < free_time_blocks.length; i++) {
			
			for (j = 0; j < eventsLeftToSchedule.length; j++) {
				// console.log('eventsLeftToSchedule');
				var freeTimeBlock = free_time_blocks[i];
				var event = eventsLeftToSchedule[j];

				console.log('freeTimeBlock');
				console.log(freeTimeBlock);
				console.log('event');
				console.log(event);

				if ((event.duration === 0) || (freeTimeBlock.duration < event.duration)) {
					continue;
				} else {
					console.log('ENTERS');
					event.start = freeTimeBlock.start;
					event.end = moment(event.start).add(event.duration, 'hours');
					eventsToDisplay.push(event);
					eventsLeftToSchedule.splice(j, 1);
					j--;

					// console.log('EVENT DURATION');
					// console.log(event.duration);
					var updatedFreeTimeBlock = {
						start: freeTimeBlock.start.add(event.duration, 'hours'),
						end: freeTimeBlock.end,
						duration: freeTimeBlock.duration - event.duration
					};
					free_time_blocks[i] = updatedFreeTimeBlock;
				};
			};

		};

		// console.log(eventsToDisplay);

		refreshCalendarEvents();
	};

	var showFlash = function showFlash(message) {
		if ( ($('#flash').css('display') === 'block') && ($('#flash').text() === message) ) {
			return;
		}

	    $('.task-time-col').prepend('<div id="flash" style="display:none"></div>');
	    $('#flash').html(message);
	    // jQuery('#flash').toggleClass('');
	    $('#flash').slideDown('slow').delay(1500).slideUp('slow');
	    // $('#flash').click(function () { $('#flash').toggle('highlight') });
	};

	var displayTasksForTimeEstimates = function displayTasksForTimeEstimates(tasksToDisplay) {

		$.each(tasksToDisplay, function(key, val) {
			var task_title = val.title;
			var task_id = val.id;
			
			$('.task_times_list').append('<tr><td>' + task_title + '</td><td><input type="numeric" class="task_time_estimate" id='+task_id+'></td></tr>')
		});

		$('.task_time_estimate').keyup(function() {
			var new_task_time_estimate = $(this).val();

			//check if not a number
			if (isNaN(new_task_time_estimate)) {
				showFlash('Not a number');
				return;
			}

			var task_id = this.id;
			tasks_time_estimates[task_id] = new_task_time_estimate;

			var time_to_add = $('#'+task_id).val();

			$.each(tasksToDisplay, function(key, val) {
				if (val.id === task_id) {
					var taskTimeEstimate = tasks_time_estimates[val.id];
					
					updateEventDuration(task_id, time_to_add); 
				}
			}.bind(this));

			calculateOptimalSchedule();
		});
	};

	$('.tasklists_list tr').click(function() {

		var isSelection = implementSelectionUI($(this));

		if (isSelection) {
			var tasksToDisplay = gon.all_tasks[this.id];

			displayTasksForTimeEstimates(tasksToDisplay);

			$.each(tasksToDisplay, function(key, val) {
				var taskTimeEstimate = tasks_time_estimates[val.id];
				var startTime = moment();
				var endTime = moment().add(1, 'hour');

				var dueDate;
				if (val.due !== undefined) {
					dueDate = moment(val.due); 
				} else {
					dueDate = moment(MAX_DATE); //no due date represented as max date
				}

				var event = {
					id: val.id,
					title: val.title,
					start: startTime,
					end: undefined,
					due: dueDate,
					duration: 0
				}

				events_list.push(event);
				
			});
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
