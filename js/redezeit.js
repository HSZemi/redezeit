function processTimeStep(state){
	var currentKey = state.current_key;
	$('#timeline').append(currentKey.toUpperCase() + " ");
	state.history.push(currentKey);
	state.registered_keys[currentKey].count += 1;
	updateTable(state);
	saveState(state);
}

function resetKeyboard(){
	$('.keyboard').removeClass("btn-primary");
}

function resetTable(){
	$('tr').removeClass("info");
}



function registerKey(state, k, name){
	key = getKeyByChar(k);
	resetKeyboard();
	setActiveKeyClasses(key);
	//createKeyButton(k,name);
	state.registered_keys[k] = {};
	state.registered_keys[k].name = name;
	state.registered_keys[k].count = 0;
	addTableRow(state, k);
	saveState(state);
}

function setActiveKeyClasses(key){
	key.addClass("btn-info");
	key.prop('disabled', true);
}

function getKeyByChar(c){
	var result;
	$('.keyboard').each(function(index, element){
		if($(this).val() == c){
			result = $(this);
		}
	});
	return result;
}

function addTableRow(state, k){
	$('#keytable').append('<tr id="row_'+k+'">' + 
			'<td class="table_x">' + 
				'<button type="button" class="close" aria-label="Remove" value="'+k+'"><span aria-hidden="true">&times;</span></button>' + 
			'</td>' + 
			'<td class="name" id="name_'+k+'">'+state.registered_keys[k].name+'</td>' + 
			'<td class="key" id="key_'+k+'">'+k.toUpperCase()+'</td>' + 
			'<td class="seconds" id="seconds_'+k+'">0</td>' + 
			'<td class="percent" id="percent_'+k+'">' + 
				'<div class="progress">' + 
					'<div id="progress_'+k+'" class="progress-bar" role="progressbar" aria-valuenow="00" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' + 
				'</div>' + 
			'</td>' + 
		'</tr>');
}

function unregisterKey(state, k){
	if(!state.is_interval_running){
		key = getKeyByChar(k);
		resetKeyboard();
		setInactiveKeyClasses(key);
		removeTableRow(k);
		delete state.registered_keys[k];
		saveState(state);
	}
}

function setInactiveKeyClasses(key){
	key.removeClass("btn-info");
	key.prop('disabled', false);
}

function removeTableRow(k){
	$('#row_' + k).remove();
}


function setKeylistTrigger(state){
	$('#keylist button').click(function(){
		key = $(this).val();
		unregisterKey(state, key);
	})
}

function updateTable(state){
	var totalseconds = 0;
	for(var key in state.registered_keys){
		totalseconds += state.registered_keys[key].count;
	}
	for(var key in state.registered_keys){
		$('#seconds_'+key).html(state.registered_keys[key].count);
		var percentage = Math.round((100 * state.registered_keys[key].count) / totalseconds);
		$('#progress_'+key).prop('aria-valuenow', percentage);
		$('#progress_'+key).css('width', percentage+'%');
	}
	
}

function updateTableClasses(state){
	resetTable();
	$('#row_'+state.current_key).addClass('info');
}

function state2table(state){
	clearTable();
	for(var key in state.registered_keys){
		addTableRow(state, key);
	}
	$('button[value="-"]').remove();
	setKeylistTrigger(state);
}

function state2keyboard(state){
	resetKeyboard();
	for(var k in state.registered_keys){
		key = getKeyByChar(k);
		if(key != undefined){
			setActiveKeyClasses(key);
		}
	}
}

function clearTable(){
	$('tr[id^="row_"]').remove();
}

function saveState(state){
	localStorage.setItem('redezeitState', JSON.stringify(state));
}

function loadState(){
	var stateJSON = localStorage.getItem('redezeitState');
	if(stateJSON == undefined){
		return new State();
	}
	try{
		var myState = JSON.parse(stateJSON);
		return myState;
	} catch (e) {
		return new State();
	}
}

function State(){
	this.registered_keys = {};
	this.interval = null;
	this.is_interval_running = false;
	this.current_key = "-";
	this.registered_keys["-"] = {};
	this.registered_keys["-"].name = 'Allgemein';
	this.registered_keys["-"].count = 0;
	this.history = new Array();
}

$().ready(function(){
	var state = loadState();
	state.is_interval_running = false;
	state.current_key = "-";
	state2table(state);
	state2keyboard(state);
	updateTable(state);
	
	
	$('#add').click(function(){
		key = $('.keyboard.btn-primary');
		if(key.length < 1){
			alert("Bitte zuerst eine Taste auswählen!");
		} else {
			var name = $('#name').val();
			registerKey(state, key.val(), name)
			setKeylistTrigger(state);
			$('#name').val('');
		}
	});
	
	$('#reset').click(function(){
		state = new State();
		state2table(state);
		updateTable(state);
		saveState(state);
	});
	
	$('#start').click(function() {
		$(this).blur();
		if(state.is_interval_running){
			clearInterval(state.interval);
			$(document).unbind("keypress");
			state.is_interval_running = false;
			$(this).html("<strong>Start</strong>");
			$('#keyrows').show(600);
			$('.table_x').show(600);
			$('#reset').show(600);
			$(this).removeClass("btn-danger");
			$(this).addClass("btn-success");
		} else {
			$(document).keypress(function(event){
				key = event.key;
				if(key == " "){
					key = "-";
				}
				if(key in state.registered_keys){
					state.current_key = key;
					updateTableClasses(state);
				}
			});
			
			state.interval = setInterval(function(){processTimeStep(state);}, 1000);
			state.is_interval_running = true;
			$(this).html("<strong>Stop</strong>");
			$('#keyrows').hide(600);
			$('.table_x').hide(600);
			$('#reset').hide(600);
			$(this).removeClass("btn-success");
			$(this).addClass("btn-danger");
			updateTableClasses(state);
		}
	});
	
	$('.keyboard').click(function(){
		resetKeyboard();
		$(this).addClass("btn-primary");
	});
}
);