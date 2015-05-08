
$(document).ready(function() {
	var calendar_events_list = [];
	var tasklist_events_list = [];
	
	var eventsToDisplay = [];
	var tasks_time_estimates = {};
	var MAX_DATE = moment().add(50, 'years'); //set as 50 years in future

	var refreshCalendarEvents = function refreshCalendarEvents(tasklist_events_list, calendar_events_list) {
		//show both tasklist and calendar events
		var all_events_list = tasklist_events_list.concat(calendar_events_list);

		console.log('refreshCalendarEvents');
		console.log(all_events_list);

		//remove curr calendar
		$('#calendar').remove();
		$('.calendar_row').append('<div id="calendar" style="display:block"></div>');

		var currTime = moment().minutes(0).seconds(0);
		var currDate = moment().hours(0).minutes(0).seconds(0);

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

		//find task to update
		for (i = 0; i < tasklist_events_list.length; i++) {
			var currTaskData = tasklist_events_list[i];
			if (currTaskData.id === task_id) {
				//update task's duration val, store in minutes
				currTaskData['duration'] = parseFloat(time_to_add)*60;
				var newTaskData = currTaskData;

				tasklist_events_list[i] = newTaskData;
			}
		}	
			
	};

	var createNewFreeTimeBlock = function createNewFreeTimeBlock(startVal, endVal) {
		return {
			start: startVal,
			end: endVal,
			duration: endVal.diff(startVal, 'minutes')
		}
	}

	var calculateFreeTimeBlocks = function calculateFreeTimeBlocks() {
		console.log('calculateFreeTimeBlocks');
		var freeTimeBlocks = [];

		var currStart = moment();
		for (i = 0; i < calendar_events_list.length; i++) {

			var currEvent = calendar_events_list[i];
			var currEventStart = currEvent.start;


			if (currStart.isBefore(currEventStart)) {
				var newFreeTimeBlock = createNewFreeTimeBlock(currStart, currEventStart);
				freeTimeBlocks.push(newFreeTimeBlock);
			} 

			// console.log('currEvent.end');
			// console.log(currEvent.end);
			currStart = currEvent.end;
		}

		var lastTimeInDay = moment().hours(23).minutes(59).seconds(59);
		if (currStart.isBefore(lastTimeInDay)) {
			var newFreeTimeBlock = createNewFreeTimeBlock(currStart, lastTimeInDay);
			freeTimeBlocks.push(newFreeTimeBlock);
		}

		return freeTimeBlocks;
	}

	var scheduleTasks = function scheduleTasks(freeTimeBlocks) {
		console.log('scheduleTasks');

		for (i = 0; i < tasklist_events_list.length; i++) {
			console.log(tasklist_events_list[i].end.format());
		}

		// for (i = 0; i < freeTimeBlocks.length; i++) {
		// 	console.log(freeTimeBlocks[i]);
		// }


		//copy tasklists event list
		var tasksLeftToSchedule = [];
		for (i = 0; i < tasklist_events_list.length; i++) {
			tasksLeftToSchedule[i] = tasklist_events_list[i];
		}

		// console.log('tasksLeftToSchedule');
		// for (i = 0; i < tasksLeftToSchedule.length; i++) {
		// 	console.log(tasksLeftToSchedule[i].title.format());
		// 	console.log(tasksLeftToSchedule[i].start.format());
		// 	console.log(tasksLeftToSchedule[i].end.format());
		// }

		var tasks_to_display = [];

		for (i = 0; i < freeTimeBlocks.length; i++) {
			for (j = 0; j < tasksLeftToSchedule.length; j++) {

				var freeTimeBlock = freeTimeBlocks[i];
				var task = tasksLeftToSchedule[j];

				// console.log('Looking at task...');
				// console.log(task.title);
				// console.log(task.start.format());
				// console.log(task.end.format());

				// console.log('Looking at freeTimeBlock...');
				// console.log(freeTimeBlock.start.format());
				// console.log(freeTimeBlock.end.format());

				if ((task.duration === 0) || (freeTimeBlock.duration < task.duration)) {
					console.log('skipped to next task');
					continue; //dont' schedule
				} else {
					console.log('didt skip to next task');
					console.log('freeTimeBlock start');
					console.log(freeTimeBlock.start.format());

					// copy task
					var updatedTask = $.extend({}, task);
					updatedTask.start = moment(freeTimeBlock.start.format());
					updatedTask.end = moment(freeTimeBlock.start.format()).add(task.duration, 'minutes');
					tasks_to_display.push(updatedTask);

					console.log('updated tasks_to_display');
					for (i = 0; i < tasks_to_display.length; i++) {
						var dateToCheckStart = tasks_to_display[i].start;
						var dateToCheckEnd = tasks_to_display[i].end;
						console.log(dateToCheckStart.format());
						console.log(dateToCheckEnd.format());
					}

					var newFreeTimeBlockStart = moment(freeTimeBlock.start.format()).add(task.duration, 'minutes');
					var updatedFreeTimeBlock = {
						start: newFreeTimeBlockStart,
						end: freeTimeBlock.end,
						duration: freeTimeBlock.duration - task.duration
					};
					freeTimeBlocks[i] = updatedFreeTimeBlock;
					
					tasksLeftToSchedule.splice(j, 1);
					j--;

				}
			}
		}
		console.log('final tasks_to_display');
		for (i = 0; i < tasks_to_display.length; i++) {
			var dateToCheck = tasks_to_display[i].end;
			console.log(dateToCheck.format());
		}

		return tasks_to_display;
	};

	var calculateOptimalSchedule = function calculateOptimalSchedule(task_id, new_task_time_estimate) {

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
		    	var tasks_to_display = callback(null, scheduleTasks(freeTimeBlocks));
		    	
		    },
		    function(tasks_to_display, callback) {
		    	refreshCalendarEvents(tasks_to_display, calendar_events_list);
		    }
		],
		function(err, result) {
		    if (err !== null) {
		    	console.log('ERR');
		    	console.log(err);
		    }
			
		});



		
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

	};

	var removeTasksForTimeEstimates = function removeTasksForTimeEstimates(tasksToRemove) {
		for (i = 0; i < tasksToRemove.length; i++) {
			$('#' + tasksToRemove[i].id).remove();
		}
	};

	var storeTaskData = function storeTaskData(tasksToDisplay) {
		$.each(tasksToDisplay, function(key, val) {
				var taskTimeEstimate = tasks_time_estimates[val.id];
				var startTime = moment();
				var endTime = moment().add(1, 'hour');

				var dueDate;
				if (val.due !== undefined) {
					dueDate = moment(val.due); 
				} else {
					dueDate = moment(MAX_DATE); //if no due date, represent with max date
				}

				var task = {
					id: val.id,
					title: 'TASK ' + val.title,
					start: startTime,
					end: endTime,
					due: dueDate,
					duration: 0
				}

				tasklist_events_list.push(task);
			});
	}

	$('.tasklists_list tr').click(function() {
		$('#task-time-estimates-instructions').css('visibility', 'visible');

		var isSelection = implementSelectionUI($(this));

		if (isSelection) {
			var tasksToDisplay = gon.all_tasks[this.id];

			async.series({
			    storeTaskData: function(callback){
			    	storeTaskData(tasksToDisplay);
			        callback(null, 1);
			    },
			    displayTaskTimeEstimatesUI: function(callback){

			    	displayTasksForTimeEstimates(tasksToDisplay);
			        callback(null, 1);
			    },
			    listenForTimeEstimateInputChange: function(callback) {
			    	console.log('for keyup');
			    	console.log(tasklist_events_list);

					$('.task_time_estimate').keyup(function() {
						console.log('keyup!');
						for (i = 0; i < tasklist_events_list.length; i++) {
							console.log(tasklist_events_list[i].end.format());
						}

						var new_task_time_estimate = $(this).val();

						//check if not a number
						if (isNaN(new_task_time_estimate)) {
							showFlash('Not a number');
							return;
						}

						//do nothing if empty string
						if (new_task_time_estimate === '' || new_task_time_estimate === 0) {
							return;
						}

						console.log('actually got here');
						var task_id = this.name;

						calculateOptimalSchedule(task_id, new_task_time_estimate);
					});			    	
			    }
			},
			function(err, results) {
			    if (!err) {
			    	console.log(results);
			    	refreshCalendarEvents(tasklist_events_list, calendar_events_list);
			    } else {
			    	console.log(err);
			    }
			}.bind(this));

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
			refreshCalendarEvents(tasklist_events_list, calendar_events_list);

		}
		

	});

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
