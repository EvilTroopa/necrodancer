var wavesurfer;

var debug = false;

var iMode = 0;

var pixPerSec = 100;

var trackName = "";

var enableSoundFx = false;

var enableCountdown = true;

var audioTick = WaveSurfer.create({
	container: '#audioTick',
	waveColor: 'red',
	progressColor: 'purple'
});
audioTick.load('sfx/tick.wav');
audioTick.setVolume(0.4);

var dropTheBeats = document.getElementById('inputBeatFile');

/*******UTILS*******/

console.log("Set 'debug' variable to true if you need console output.");
function debugMe(text){

	if(debug) console.log(text);

}

function download(filename, text) {

	var pom = document.createElement('a');

	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));

	pom.setAttribute('download', filename);

	if (document.createEvent) {

		var event = document.createEvent('MouseEvents');

		event.initEvent('click', true, true);

		pom.dispatchEvent(event);
	}

	else {

		pom.click();

	}

}


function countdown(iCountdown){

	if ($('#countdown')) $('#countdown').remove();

	$('#beatInput').focus();

	if (iCountdown > 0 && enableCountdown){

		debugMe(iCountdown+'...');

		if (enableSoundFx) {
			if (!audioCountdown) {
				var audioCountdown = new Audio('sfx/countdown.wav');
			}
			audioCountdown.play();
		}

		$('body').append('<div id="countdown">' + iCountdown + '</div>');

		$('#countdown').animate({opacity: 0}, 400);

		setTimeout(function(){ countdown(iCountdown-1) }, 1000);

	} else {

		debugMe('go !');

		$('#btnStop0').prop('disabled', false);

		wavesurfer.playPause();

	}

}
/********I********/


/**
 * Initialize listeners when appropriate
 */
$(document).ready(function(){

	var dropZone = document.getElementById('dropSong');

	dropZone.addEventListener("dragenter", dragEnter, false);

	dropZone.addEventListener("dragexit", dragExit, false);

	dropZone.addEventListener("dragover", dragOver, false);

	dropZone.addEventListener("drop", doDrop, false);


	wavesurfer = WaveSurfer.create({
		container: '#trackVisualisation',
		waveColor: 'red',
		progressColor: 'purple'

	});

	$( "#accordion" ).accordion({

		collapsible: true,

		active: false,

		heightStyle: 'content'

	});

	$('#enableSoundFx').change(function(){
			enableSoundFx = $(this).is(':checked');
	});

	$('#enableCountdown').change(function(){
		enableCountdown = $(this).is(':checked');
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

		initMarkersMode1();

		$('#tempo').on('change drag input', function(){

			var tempo = $(this).val();

			$('#tempoNum').val(tempo);

			updateMarkersMode1(50);

		});

		$('#tempo').mouseup( function(){

			var tempo = $(this).val();

			$('#tempoNum').val(tempo);

			updateMarkersMode1();

		});

		$('#tempoNum').val($('#tempo').val());

		$('#offset').on('change drag input', function(){

			var offset = $(this).val();

			$('#offsetNum').val(offset);

			updateMarkersMode1(50);

		});

		$('#offset').mouseup(function(){

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

		wavesurfer.on('region-click',function(region){

			var regionsStarts = Object
				.values(wavesurfer.regions.list)
				.map(function(region) {return region.start;});
			var indexOfRegion = regionsStarts.indexOf(region.start);

			if (indexOfRegion > 0) {
				var durationForNBeats = (region.start - regionsStarts[0]);
				var durationPerBeat = durationForNBeats / indexOfRegion;
				var tempo = 60 / durationPerBeat;
				$('#tempoNum').val(tempo);
				$('#tempo').val(tempo);
			} else {
				$('#offset').val(region.start);
				$('#offsetNum').val(region.start);
			}

			updateMarkersMode1();
		})


	});

	$('#btnMode2').click(function(){

		dropTheBeats.addEventListener('change', function() {
			var beatInFile = this.files[0];
			debugMe('found file' + beatInFile.name);

			var beatFileReader = new FileReader();
			beatFileReader.addEventListener('load', function() {

				var beatTimesInArray = beatFileReader.result.split('\n');
				debugMe('found ' + beatTimesInArray.length + ' beats');
				debugMe(JSON.stringify(beatTimesInArray));

				for(var i = 0; i< beatTimesInArray.length ; i++) {
					var beatTime = beatTimesInArray[i];
					debugMe('Processing ' + beatTime + ' == ' + parseFloat(beatTime));
					addOneBeat(parseFloat(beatTime));
				}

				$('#selectMode').hide();
				$('#btnMode0').click();
				$('#btnExport0').prop('disabled', false);
			});
			beatFileReader.readAsText(beatInFile, 'UTF-8');
		})

		dropTheBeats.click();

	});



});


/*** UPLOAD BY DRAG AND DROP ***/
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
/********I********/


/**
 * When audio player is ready
 */
function initDropSurfer(){

	$('#trackVisualisation').show();

	$('#dropSong').remove();

	exportFile = function(){

		if(getBeatsCount() > 0) {

			var beatsFileData = Object.values(wavesurfer.regions.list).map(function(region) {return region.start;});
			debugMe(beatsFileData);
			download(
				trackName+'.txt',
				beatsFileData
					.sort(function(a, b){return a-b})
					.map(function(tempo) {return tempo.toString().substring(0,10)}).join('\n')
			);
		}
	}

	$('#btnExport0').click(function(){
		exportFile();
		debugMe('One file exported !');
	});

	$('#btnExport1').click(function(){
		exportFile();
		debugMe('One file exported !');
	});



	/* Progress bar */

	(function () {

		var progressDiv = $('#progressBar');

		var progressBar = progressDiv.find('.progressBar');


		var showProgress = function (percent) {

			progressDiv.show();

			progressBar.css('width', percent + '%');

		};

		function playTick(region) {

			debugMe('ticked for region : ' + region.id + ' ' + region.start + ' ' + region.firedIn);
			if (enableSoundFx) {
				audioTick.play();
			} else {
				alert('Error : ' + error);
			}

		};

		var doError = function (error) {

			progressDiv.hide();

			$('#trackVisualisation').hide();

			if (error.toString().indexOf('decoding audio') > -1) {
				alert('Your browser cannot decode this audio file ! ' +
					'\nYup, this happens sometimes... ' +
					'\nTry with another one. Chrome is good at this !');
			}


		};


		wavesurfer.on('loading', showProgress);

		wavesurfer.on('ready', doSelect);

		wavesurfer.on('destroy', doError);

		wavesurfer.on('error', doError);

		wavesurfer.on('play', doStart);

		wavesurfer.on('finish', doFinish);

		wavesurfer.on('region-in', playTick);


	}());

	getBeatsCount = function() {
		return Object.keys(wavesurfer.regions.list).length;
	};

	//Allow creation of new beats
	addOneBeat = function(fCurrTime){

		var region = {
			start: fCurrTime, // time in seconds
			end: fCurrTime+0.04, // time in seconds
			color: 'hsla(100, 100%, 100%, 0.7)',
			resize: false

		}

		var addedRegion = wavesurfer.addRegion(region);

		debugMe('added one beat : ' + addedRegion);
		debugMe('Total is '+getBeatsCount());

	}


	//Allow deletion of one beat
	deleteOneBeat = function(region){

		debugMe(region + " will be removed.");

		wavesurfer.regions.list[region.id].remove();

		debugMe('removed beat : ' + region.start);

		debugMe('now '+ getBeatsCount() +' beats');

		setAndReady = true;
	}

	//Allow deletion of all beats
	deleteAllBeats = function(){

		wavesurfer.clearRegions();

	}


	$('#trackVisualisation').append('<input id="beatInput" />');


	$('#btnRecord0').click(function(){

		$(this).prop('disabled', true);

		$('#btnExport0').prop('disabled', true);


		countdown(3);

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

/**
 * Add beats
 * @type {boolean}
 */
var setAndReady = false;
function doSelect(){

	trackName = $('#trackName0').val();

	$('#trackTitle').html(trackName);

	$('#progressBar').hide();

	$('#trackVisualisation').removeClass('empty');

	$('#trackDuration1').val(wavesurfer.getDuration());

	$('#selectMode').show();

	debugMe('Getting ready ! ');

	if(!setAndReady){

		wavesurfer.zoom(pixPerSec);

		wavesurfer.enableDragSelection({});

		var keyHeldDown = false;
		$('#beatInput').on('keydown', function(event){

			if((event.which | event.keyCode) != 13){

				var fCurrTime = wavesurfer.getCurrentTime();

				if (!keyHeldDown && enableSoundFx) {
					keyHeldDown = true;
					audioTick.play();
				}

				addOneBeat(fCurrTime);

			}else{
				$('#btnStop0').trigger('click');
			}

			return false;

		});

		$('#beatInput').on('keyup', function(event){
			keyHeldDown = false;
			return false;
		});

		wavesurfer.on('region-dblclick',function(region){

			deleteOneBeat(region);

		})
	}




}

/**
 * Keep focus
 */
function doStart(){

	$('#beatInput').on('blur', function(event){

		$(this).focus();

	});

}

/**
 * Enable export
 */
function doFinish(){

	$('#btnStop0').prop('disabled', true);

	$('#btnRecord0').prop('disabled', false);

	$('#btnExport0').prop('disabled', false);

	debugMe("Stopped. Now " + getBeatsCount() + " beats ")

}
/**
 * Create beats with tempo-based mode
 */
function initMarkersMode1(max){

	var duration = wavesurfer.getDuration();

	var offset = parseFloat($('#offset').val());

	var tempo = parseFloat($('#tempo').val());

	var beatDuration = 60 / tempo;



	var numBeats = max || parseInt((duration - offset) / beatDuration);

	var fCurrTime = offset;



	for(var i = 0; i < numBeats; i++){

		addOneBeat(fCurrTime);

		fCurrTime += beatDuration;

	}

}

/**
 * Update beats with tempo based mode
 */
function updateMarkersMode1(max){

	deleteAllBeats();

	initMarkersMode1(max);

}