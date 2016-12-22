var wavesurfer;var beats = [];var debug=false;var iMode = 0;var pixPerSec = 100;var markWidth = 4;var markColor = "#FFF";var trackName = "";/*******UTILS*******/console.log("Set 'debug' variable to true if you need console output.");function debugMe(text){	if(debug) console.log(text);}function download(filename, text) {	var pom = document.createElement('a');	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));	pom.setAttribute('download', filename);	if (document.createEvent) {		var event = document.createEvent('MouseEvents');		event.initEvent('click', true, true);		pom.dispatchEvent(event);	}	else {		pom.click();	}}function countdown(iCountdown){	if($('#countdown')) $('#countdown').remove();	if(iCountdown > 0){		debugMe(iCountdown+'...');		$('body').append('<div id="countdown">' + iCountdown + '</div>');		$('#countdown').animate({opacity: 0}, 400);		$('#beatInput').focus();		setTimeout(function(){ countdown(iCountdown-1) }, 1000);	}else{		debugMe('go !');		$('#btnStop0').prop('disabled', false);		wavesurfer.playPause();	}}$(document).ready(function(){	var dropZone = document.getElementById('dropSong');	dropZone.addEventListener("dragenter", dragEnter, false);	dropZone.addEventListener("dragexit", dragExit, false);	dropZone.addEventListener("dragover", dragOver, false);	dropZone.addEventListener("drop", doDrop, false);	wavesurfer = WaveSurfer.create({		container: '#trackVisualisation',		waveColor: 'red',		progressColor: 'purple'	});	$( "#accordion" ).accordion({		collapsible: true,		active: false,		heightStyle: 'content'	});	$('#btnMode0').click(function(){		iMode = 0;		$('#selectMode').hide();		$('#trackControlsMode0').show();	});	$('#btnMode1').click(function(){		iMode = 1;		$('#selectMode').hide();		$('#trackControlsMode1').show();		wavesurfer.on('mark', function(){document.getElementById('audioTick').play();});		initMarkersMode1();	});	$('#tempo').on('change drag input', function(){		var tempo = $(this).val();		$('#tempoNum').val(tempo);		updateMarkersMode1(50);	});	$('#tempo').mouseup( function(){		var tempo = $(this).val();		$('#tempoNum').val(tempo);		updateMarkersMode1();	});	$('#tempoNum').val($('#tempo').val());	$('#offset').on('change drag input', function(){		var offset = $(this).val();		$('#offsetNum').val(offset);		updateMarkersMode1(50);	});	$('#offset').mouseup(function(){		var offset = $(this).val();		$('#offsetNum').val(offset);		updateMarkersMode1();	});	$('#offsetNum').val($('#offset').val());	$('#tempoNum').on('change drag input blur', function(){		var tempo = $(this).val();		if(!isNaN(tempo)){			$('#tempo').val(tempo);			updateMarkersMode1();		}	});	$('#offsetNum').on('change drag input blur', function(){		var offset = $(this).val();		if(!isNaN(offset)){			$('#offset').val(offset);			updateMarkersMode1();		}	});});function dragOver(e){	e.preventDefault();	e.stopPropagation();}function dragExit(e){	$('#dropSong').removeClass('hover');	e.preventDefault();	e.stopPropagation();}function dragEnter(e){	$('#dropSong').addClass('hover');	e.preventDefault();	e.stopPropagation();}function doDrop(e){	e.preventDefault();	e.stopPropagation();	$('#dropSong').removeClass('hover');	var dt = e.dataTransfer;	if(dt.files.length > 1){		alert('Can I haz 1 file at a time plz?');		return;	}	initDropSurfer();	$('#trackName0').val(dt.files[0].name);	$('#trackName1').val(dt.files[0].name);	wavesurfer.loadBlob(dt.files[0]);}function initDropSurfer(){	$('#trackVisualisation').show();	$('#dropSong').remove();	exportFile = function(){		if(beats.length > 0){			var beatsFileData = beats.map(function(region){return region.start.toString().substring(0,10)}).join("\n");			download(trackName+'.txt', beatsFileData);		}	}	$('#btnExport0').click(function(){		exportFile();		debugMe('One file exported !');	});	$('#btnExport1').click(function(){		exportFile();		debugMe('One file exported !');	});	/* Progress bar */	(function () {		var progressDiv = $('#progressBar');		var progressBar = progressDiv.find('.progressBar');		var showProgress = function (percent) {			progressDiv.show();			progressBar.css('width', percent + '%');		};		var doError = function () {			progressDiv.hide();			$('#trackVisualisation').hide();			alert('Wrong type of file !');		};		wavesurfer.on('loading', showProgress);		wavesurfer.on('ready', doSelect);		wavesurfer.on('destroy', doError);		wavesurfer.on('error', doError);		wavesurfer.on('play', doStart);		wavesurfer.on('finish', doFinish);	}());	//Allow creation of new beats	addOneBeat = function(fCurrTime){		var region = {			start: fCurrTime, // time in seconds			end: fCurrTime+0.04, // time in seconds			color: 'hsla(100, 100%, 100%, 0.7)',			resize: false		}		wavesurfer.addRegion(region);		beats.push(region);		debugMe('added one beat. Total is '+beats.length);	}	//Allow deletion of one beat	deleteOneBeat = function(region){		var regionInArray = $.grep(beats, function(e){ return e.start == region.start; })[0];		var indexOfRegion = beats.indexOf(regionInArray);		debugMe(region);		debugMe(regionInArray);		debugMe(indexOfRegion + " will be removed.");		beats.splice(indexOfRegion,1);		wavesurfer.clearRegions();		beats.map(function(reg){wavesurfer.addRegion(reg);})		debugMe('removed beat : ' + region.start);		debugMe('now '+ beats.length+' beats');		region = null;		setAndReady = true;	}	//Allow deletion of all beats	deleteAllBeats = function(){		beats = [];		wavesurfer.clearRegions();	}	$('#trackVisualisation').append('<input id="beatInput" />');	$('#btnRecord0').click(function(){		$(this).prop('disabled', true);		$('#btnExport0').prop('disabled', true);		countdown(3);	});	$('#btnStop0').click(function(){		wavesurfer.stop();		doFinish();	});	$('#btnPlay1').click(function(){		$(this).prop('disabled', true);		$('#btnStop1').prop('disabled', false);		$('#tempo').prop('disabled', true);		$('#offset').prop('disabled', true);		wavesurfer.play();	});	$('#btnStop1').click(function(){		$(this).prop('disabled', true);		$('#btnPlay1').prop('disabled', false);		$('#tempo').prop('disabled', false);		$('#offset').prop('disabled', false);		wavesurfer.stop();	});}var setAndReady = false;function doSelect(){	trackName = $('#trackName0').val();	$('#trackTitle').html(trackName);	$('#progressBar').hide();	$('#trackVisualisation').removeClass('empty');	$('#trackDuration1').val(wavesurfer.getDuration());	$('#selectMode').show();	if(!setAndReady){		wavesurfer.zoom(pixPerSec);		wavesurfer.enableDragSelection({});		$('#beatInput').on('keydown', function(event){			if((event.which | event.keyCode) != 13){				var fCurrTime = wavesurfer.getCurrentTime();				addOneBeat(fCurrTime);			}else{				console.log('stop !');				$('#btnStop0').trigger('click');			}			return false;		});		wavesurfer.on('region-dblclick',function(region){			deleteOneBeat(region);		})	}}function doStart(){	$('#beatInput').on('blur', function(event){		$(this).focus();	});}function doFinish(){	$('#btnStop0').prop('disabled', true);	$('#btnRecord0').prop('disabled', false);	$('#btnExport0').prop('disabled', false);	debugMe("Stopped. Now " + beats.length + " beats ")}function initMarkersMode1(max){	var duration = wavesurfer.getDuration();	var offset = parseFloat($('#offset').val());	var tempo = parseFloat($('#tempo').val());	var beatDuration = 60 / tempo;	var numBeats = max || parseInt((duration - offset) / beatDuration);	var fCurrTime = offset;	for(var i = 0; i < numBeats; i++){		addOneBeat(fCurrTime);		fCurrTime += beatDuration;	}}function updateMarkersMode1(max){	deleteAllBeats();	initMarkersMode1(max);}