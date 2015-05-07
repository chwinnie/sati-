
$(document).ready(function() {
	//gon.all_events
	//gon.all_tasks

	// var events_list = [];
	var calendar_events_list = [];
	var tasklist_events_list = [];
	
	var eventsToDisplay = [];
	var tasks_time_estimates = {};
	var MAX_DATE = moment().add(50, 'years'); //set as 50 years in future

	tasks_list = [
		{id: 13413, title: 'task 1', 
			startTime: moment().format(), 
			endTime: moment().add(1, 'hour').format(), 
			dueDate: moment('5/6/2015')},
		{id: 13413, 
			title: 'task 2', 
			startTime: moment().format(), 
			endTime: moment().add(1, 'hour').format(), 
			dueDate: moment('5/5/2015')},
		{id: 13413, 
			title: 'task 3', 
			startTime: moment().format(), 
			endTime: moment().add(1, 'hour').format(), 
			dueDate: moment('8/5/2015')}
	];

	var refreshCalendarEvents = function refreshCalendarEvents(tasklist_events_list, calendar_events_list) {
		var all_events_list = tasklist_events_list.concat(calendar_events_list);

		console.log('refreshCalendarEvents');
		console.log(all_events_list);

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
			minTime: currTime,
			defaultView: 'agendaDay',	
			defaultDate: currDate,
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			events: all_events_list
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

	var updateTaskDuration = function updateTaskDuration(task_id, time_to_add) {
		console.log('updateTaskDuration');
		console.log(tasklist_events_list);
		console.log(task_id);
		console.log(time_to_add);

		var taskIndexToUpdate;
		var currTaskData;

		$.each(tasklist_events_list, function(i, val) {
			if (val.id === task_id) {
				taskIndexToUpdate = i;
				currTaskData = val;
			}	
		});

		console.log(taskIndexToUpdate);
		console.log(currTaskData);

		currTaskData['duration'] = time_to_add;
		tasklist_events_list[taskIndexToUpdate] = currTaskData;	

		console.log(tasklist_events_list);
			
	};

	var createNewFreeTimeBlock = function createNewFreeTimeBlock(startVal, endVal) {
		return {
			start: startVal,
			end: endVal,
			duration: endVal - startVal
		}
	}

	var calculateFreeTimeBlocks = function calculateFreeTimeBlocks() {
		console.log('calculateFreeTimeBlocks');
		var freeTimeBlocks = [];

		// console.log('calendar_events_list');
		// console.log(calendar_events_list);

		var currStart = moment();
		for (i = 0; i < calendar_events_list.length; i++) {
			var currEvent = calendar_events_list[i];
			var currEventStart = currEvent.start;

			if (currStart.isBefore(currEventStart)) {
				var newFreeTimeBlock = createNewFreeTimeBlock(currStart, currEventStart);
				freeTimeBlocks.push(newFreeTimeBlock);
				currStart = currEvent.end;
			}
		}

		var lastTimeInDay = moment().hours(23).minutes(59).seconds(59);
		if (currStart.isBefore(lastTimeInDay)) {
			var newFreeTimeBlock = createNewFreeTimeBlock(currStart, lastTimeInDay);
			freeTimeBlocks.push(newFreeTimeBlock);
		}

		// console.log(freeTimeBlocks);
		return freeTimeBlocks;
	}

	var scheduleTasks = function scheduleTasks(freeTimeBlocks) {
		console.log('scheduleTasks');
		var tasksLeftToSchedule = tasklist_events_list;
		tasklist_events_list = [];

		for (i = 0; i < freeTimeBlocks.length; i++) {
			for (j = 0; j < tasksLeftToSchedule.length; j++) {

				var freeTimeBlock = freeTimeBlocks[i];
				var task = tasksLeftToSchedule[j];

				if ((task.duration === 0) || (freeTimeBlock.duration < task.duration)) {
					continue; //dont' schedule
				} else {

					task['start'] = freeTimeBlock.start;
					task['end'] = freeTimeBlock.start.add(task.duration, 'hours');

					var updatedTask = task;
					tasklist_events_list.push(updatedTask);

					var updatedFreeTimeBlock = {
						start: freeTimeBlock.start.add(task.duration, 'hours'),
						end: freeTimeBlock.end,
						duration: freeTimeBlock.duration - task.duration
					};
					freeTimeBlocks[i] = updatedFreeTimeBlock;
					
					tasksLeftToSchedule.splice(j, 1);
					j--;

				}
			}
		}
		console.log(tasklist_events_list);
	};

	var calculateOptimalSchedule = function calculateOptimalSchedule(task_id, new_task_time_estimate) {
		console.log('calculateOptimalSchedule'); 
		console.log(task_id);
		console.log(new_task_time_estimate);
		async.waterfall([
			function(callback) {
				updateTaskDuration(task_id, new_task_time_estimate);
				callback(null);
			},
			function(callback){
				console.log('tasklist sort');
		        //sort events_list by dueDate, assume dueDates are Moments
				tasklist_events_list.sort(function(t1, t2) {
					var dueDate1 = t1.due;
					var dueDate2 = t2.due;
					return dueDate1.diff(dueDate2);
				});
		        callback(null);
		        
		    },
		    function(callback){
		    	console.log('calendar sort');
		    	//sort calendar events by start time
				calendar_events_list.sort(function(b1, b2) {
					var start1 = b1.start;
					var start2 = b2.start;
					return start1.diff(start2);
				});
		        callback(null);
		    },
		    function(callback){
		        callback(null, calculateFreeTimeBlocks());
		    },
		    function(freeTimeBlocks, callback) {
		    	console.log(freeTimeBlocks);
		    	callback(null, scheduleTasks(freeTimeBlocks));
		    },
		    function(callback) {
		    	refreshCalendarEvents(tasklist_events_list, calendar_events_list);
		    }
		],
		function(err, result) {
		    if (err !== null) {
		    	console.log(err);
		    }
			
		}.bind(this));



		
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
			
			$('.task_times_list').append('<tr id="'+task_id+'"><td>' + task_title + '</td><td><input type="numeric" class="task_time_estimate" name="'+task_id+'""></td></tr>')
		});

		$('.task_time_estimate').keyup(function(e) {
			var new_task_time_estimate = $(this).val();

			//check if not a number
			if (isNaN(new_task_time_estimate)) {
				showFlash('Not a number');
				return;
			}

			//do nothing if empty string
			if (new_task_time_estimate === '') {
				return;
			}

			var task_id = this.name;

			calculateOptimalSchedule(task_id, new_task_time_estimate);
		});
	};

	var removeTasksForTimeEstimates = function removeTasksForTimeEstimates(tasksToRemove) {
		for (i = 0; i < tasksToRemove.length; i++) {
			$('#' + tasksToRemove[i].id).remove();
		}
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

				var task = {
					tasklist_id: this.id,
					id: val.id,
					title: 'TASK ' + val.title,
					start: startTime,
					end: endTime,
					due: dueDate,
					duration: 0
				}

				tasklist_events_list.push(task);
				
			}.bind(this));

			refreshCalendarEvents(tasklist_events_list, calendar_events_list);
		} else {
			var tasksToRemove = gon.all_tasks[this.id];

			removeTasksForTimeEstimates(tasksToRemove);

			for (i = 0; i < tasksToRemove.length; i++) {
				for (j = 0; j < tasklist_events_list.length; j++) {
					if (tasksToRemove[i].id === tasklist_events_list[j].id) {
						tasklist_events_list.splice(j, 1);
						j--;
					}
				}
			}
			// console.log(tasklist_events_list);

			refreshCalendarEvents(tasklist_events_list, calendar_events_list);

		}
		

	});

	// var isTimeWithinToday = function isTimeWithinToday(moment_date) {
	// 	var cleanedDate = moment_date.hours(0).minutes(0).seconds(0);
	// 	var cleanedToday = moment().hours(0).minutes(0).seconds(0);

	// 	console.log('cleanedDate');
	// 	console.log(cleanedDate);

	// 	console.log('cleanedToday');
	// 	console.log(cleanedToday);

	// 	return cleanedDate.isSame(cleanedToday);
	// }

	$('.calendars_list tr').click(function() {
		var isSelection = implementSelectionUI($(this));

		if (isSelection) {
			var eventsToDisplay = gon.all_events[this.id];

			console.log('eventsToDisplay');
			console.log(eventsToDisplay);

			$.each(eventsToDisplay, function(key, val) {
				//continue if cancelled event or undefined start and end dates
				if ((val.status === 'cancelled') || (val.start.dateTime === undefined) || (val.end.dateTime === undefined)) {
					return true;
				}

				var startTime = moment(val.start.dateTime);
				

				if (val.title === undefined) {
					val.title = '';
				}
				
				var event = {
					cal_id: this.id,
					id: val.id,
					title: 'EVENT ' + val.summary,
					start: startTime,
					end: moment(val.end.dateTime)
				}
				
				calendar_events_list.push(event);

			}.bind(this));

			// console.log(calendar_events_list);
			refreshCalendarEvents(tasklist_events_list, calendar_events_list);
		} else {

			for (i = 0; i < calendar_events_list.length; i++) {
				if (calendar_events_list[i].cal_id === this.id) {
					calendar_events_list.splice(i, 1);
					i--;
				}
			};

			refreshCalendarEvents(tasklist_events_list, calendar_events_list);
		}

	});
	
	refreshCalendarEvents(tasklist_events_list, calendar_events_list);

});
