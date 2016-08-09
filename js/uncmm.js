var wavesurfer;
var beats = [];
var iCountdown = 0;
var iTimeoutId;
var iMode = 0;
var pixPerSec = 128;
var markWidth = 4;
var updatingMarks = false;

var markColor = "#FFF";

$(document).ready(function(){
	var dropZone = document.getElementById('dropSong');
	
	dropZone.addEventListener("dragenter", dragEnter, false);
	dropZone.addEventListener("dragexit", dragExit, false);
	dropZone.addEventListener("dragover", dragOver, false);
	dropZone.addEventListener("drop", doDrop, false);
	
	wavesurfer = Object.create(WaveSurfer);
	$( "#accordion" ).accordion({
      collapsible: true,
      active: false,
      heightStyle: 'content'
    });
	
	$('#btnMode0').click(function(){
		iMode = 0;
		$('#selectMode').hide();
		$('#trackControlsMode0').show();
	});
	$('#btnMode1').click(function(){
		iMode = 1;
		$('#selectMode').hide();
		$('#trackControlsMode1').show();
		wavesurfer.on('mark', function(){document.getElementById('audioTick').play();});
		initMarkersMode1();
	});
	$('#tempo').on('change drag input', function(){
		var tempo = $(this).val();
		$('#tempoNum').val(tempo);
		updateMarkersMode1();
	});
	$('#tempoNum').val($('#tempo').val());
	$('#offset').on('change drag input', function(){
		var offset = $(this).val();
		$('#offsetNum').val(offset);
		updateMarkersMode1();
	});
	$('#offsetNum').val($('#offset').val());
	$('#tempoNum').on('change drag input blur', function(){
		var tempo = $(this).val();
		if(!isNaN(tempo)){
			$('#tempo').val(tempo);
			updateMarkersMode1();
		}
	});
	$('#offsetNum').on('change drag input blur', function(){
		var offset = $(this).val();
		if(!isNaN(offset)){
			$('#offset').val(offset);
			updateMarkersMode1();
		}
	});
});

function dragOver(e){
	e.preventDefault();
	e.stopPropagation();
}

function dragExit(e){
	$('#dropSong').removeClass('hover');
	e.preventDefault();
	e.stopPropagation();
}

function dragEnter(e){
	$('#dropSong').addClass('hover');
	e.preventDefault();
	e.stopPropagation();
}

function doDrop(e){
	e.preventDefault();
	e.stopPropagation();
	$('#dropSong').removeClass('hover');
	var dt = e.dataTransfer;
	if(dt.files.length > 1){
		alert('Can I haz 1 file at a time plz?');
		return;
	}
	initDropSurfer();
	$('#trackName0').val(dt.files[0].name);
	$('#trackName1').val(dt.files[0].name);
	wavesurfer.loadBlob(dt.files[0]);
}

function initDropSurfer(){
	$('#trackVisualisation').show();
	
	var options = {
		container: document.getElementById('trackVisualisation'),
		waveColor: '#F0F',
		progressColor: '#909',
		loaderColor: '#909',
		cursorColor: '#FF0',
		markerWidth: markWidth,
		minPxPerSec: pixPerSec,
		scrollParent: true,
		interact: false,
		dragSelection: false
	};
	
	/* Progress bar */
	(function () {
		var progressDiv = $('#progressBar');
		var progressBar = progressDiv.find('.progressBar');
		
		var showProgress = function (percent) {
			progressDiv.show();
			progressBar.css('width', percent + '%');
		};
		
		var doError = function () {
			progressDiv.hide();
			$('#trackVisualisation').hide();
			alert('Wrong type of file !');
		};
		
		wavesurfer.on('loading', showProgress);
		wavesurfer.on('ready', doSelect);
		wavesurfer.on('destroy', doError);
		wavesurfer.on('error', doError);
		wavesurfer.on('play', doStart);
		wavesurfer.on('finish', doFinish);
	}());
	
	// Init
	wavesurfer.init(options);
	
	$('#btnRecord0').click(function(){
		$(this).prop('disabled', true);
		$('#btnExport0').prop('disabled', true);
		beats = [];
		wavesurfer.clearMarks();
		$('#trackVisualisation').find('mark').remove();
		$('#trackVisualisation > wave').scrollLeft(0);
		$('#trackVisualisation').append('<input id="beatInput" />');
		
		iCountdown = 4;
		countdown();
	});
	$('#btnStop0').click(function(){
		wavesurfer.stop();
		doFinish();
	});
	
	$('#btnPlay1').click(function(){
		$(this).prop('disabled', true);
		$('#btnStop1').prop('disabled', false);
		$('#tempo').prop('disabled', true);
		$('#offset').prop('disabled', true);
		wavesurfer.play();
	});
	$('#btnStop1').click(function(){
		$(this).prop('disabled', true);
		$('#btnPlay1').prop('disabled', false);
		$('#tempo').prop('disabled', false);
		$('#offset').prop('disabled', false);
		wavesurfer.stop();
	});
	
}

function doSelect(){
	$('#trackTitle').html($('#trackName0').val());
	$('#progressBar').hide();
	$('#trackVisualisation').removeClass('empty');
	$('#trackDuration1').val(wavesurfer.getDuration());
	$('#selectMode').show();
}

function doStart(){
	$('#beatInput').on('keypress', function(event){
		console.log(event.which + " " + event.keyCode);
		if((event.which | event.keyCode) != 13){
			var fCurrTime = wavesurfer.getCurrentTime();
			beats.push(fCurrTime);
			wavesurfer.mark({position: fCurrTime, color: markColor, id: 'mark' + fCurrTime});
		}else{
			console.log('stop !');
			$('#btnStop0').trigger('click');
		}
		return false;
	});
	$('#beatInput').on('blur', function(event){
		$(this).focus();
	});
}
function doFinish(){
	$('#btnStop0').prop('disabled', true);
	$('#btnRecord0').prop('disabled', false);
	$('#beatInput').unbind('keypress');
	$('#beatInput').unbind('blur');
	$('#beatInput').remove();
	if(beats.length > 0){
		$('#beatData0').val(beats.join(';'));
		$('#btnExport0').prop('disabled', false);
	}
}

function countdown(){
	if($('#countdown')) $('#countdown').remove();
	iCountdown--;
	if(iCountdown > 0){
		$('body').append('<div id="countdown">' + iCountdown + '</div>');
		$('#countdown').animate({opacity: 0}, 400);
		$('#beatInput').focus();
		document.getElementById('audioCountdown').play();
		iTimeoutId = setTimeout(countdown, 1000);
	}else{
		$('#btnStop0').prop('disabled', false);
		wavesurfer.playPause();
	}
}

function initMarkersMode1(){
	var duration = wavesurfer.getDuration();
	var offset = parseFloat($('#offset').val());
	var tempo = parseFloat($('#tempo').val());
	var beatDuration = 60 / tempo;
	
	var numBeats = parseInt((duration - offset) / beatDuration);
	var fCurrTime = offset;
	
	for(var i = 0; i < numBeats; i++){
		wavesurfer.mark({position: fCurrTime, color: markColor, id: 'mark_' + i});
		fCurrTime += beatDuration;
	}
}

function updateMarkersMode1(){
	var duration = wavesurfer.getDuration();
	var offset = parseFloat($('#offset').val());
	var tempo = parseFloat($('#tempo').val());
	var beatDuration = 60.0 / tempo;
	var cssLeftRatio = pixPerSec * beatDuration * 2;
	
	var numBeats = parseInt((duration - offset) / beatDuration);
	
	var lastMark = $('#trackVisualisation > wave > mark:last');
	var lastMarkId = parseInt(lastMark.attr('id').replace('mark_', ''));
	
	var maxIdToUpdate = lastMarkId;
	if(numBeats < lastMarkId){
		maxIdToUpdate = numBeats;
		for(var i = numBeats + 1; i <= lastMarkId; i++){
			wavesurfer.markers['mark_' + i].remove();
		}
	}
	
	var fCurrTime = offset;
	var markWidthOffset = markWidth / 2;
	for(var i = 0; i <= maxIdToUpdate; i++){
		try{
			wavesurfer.markers['mark_' + i].position = fCurrTime;
			wavesurfer.markers['mark_' + i].percentage = fCurrTime / duration;
		}catch(e){
			wavesurfer.mark({id: 'mark_' + i, position: fCurrTime, color: markColor});
		}
		$('#mark_' + i).attr('title', fCurrTime);
		$('#mark_' + i).css({left: parseInt(fCurrTime * cssLeftRatio - markWidthOffset) + 'px'})
		fCurrTime += beatDuration;
	}
	if(numBeats > maxIdToUpdate){
		for(var i = maxIdToUpdate + 1; i <= numBeats; i++){
			wavesurfer.mark({id: 'mark_' + i, position: fCurrTime, color: markColor});
			fCurrTime += beatDuration;
		}
	}
}