function PreAssistant() {
}

PreAssistant.prototype.setup = function() {

	// force portrait mode
	if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("up");
	}

	// create the drop-down menu
	this.appMenuModel = this.controller.setupWidget(Mojo.Menu.appMenu,
							{omitDefaultItems: true},

							{
								visible: true,
								items: [
							    		{ label: "Help", command: 'menu-help' },
							    		{ label: "About", command: 'menu-about' },
							    		{ label: "E-mail Support", command: 'menu-support' }
								]
							});



	this.mediaSetup();

	// create references for cleanup (.stopListening() doesn't work with .bind(this))
	this.sixthTap = this.sixthTap.bind(this);
	this.fifthTap = this.fifthTap.bind(this);
	this.fourthTap = this.fourthTap.bind(this);
	this.thirdTap = this.thirdTap.bind(this);
	this.secondTap = this.secondTap.bind(this);
	this.firstTap = this.firstTap.bind(this);
	this.standardTap = this.standardTap.bind(this);
	this.droppedDTap = this.droppedDTap.bind(this);
	this.proTap = this.proTap.bind(this);

	// references
	this.sixth = this.controller.get("sixthString");
	this.fifth = this.controller.get("fifthString");
	this.fourth = this.controller.get("fourthString");
	this.third = this.controller.get("thirdString");
	this.second = this.controller.get("secondString");
	this.first = this.controller.get("firstString");
	this.standard = this.controller.get("standard");
	this.droppedD = this.controller.get("droppedD");
	this.pro = this.controller.get("pro");
	this.standardOverlay = this.controller.get("standard-overlay");
	this.droppedDOverlay = this.controller.get("droppedD-overlay");
	this.onOverlay = this.controller.get("onOverlay");

	// create listeners for strings
	Mojo.Event.listen(this.sixth, Mojo.Event.tap, this.sixthTap);
	Mojo.Event.listen(this.fifth, Mojo.Event.tap, this.fifthTap);
	Mojo.Event.listen(this.fourth, Mojo.Event.tap, this.fourthTap);
	Mojo.Event.listen(this.third, Mojo.Event.tap, this.thirdTap);
	Mojo.Event.listen(this.second, Mojo.Event.tap, this.secondTap);
	Mojo.Event.listen(this.first, Mojo.Event.tap, this.firstTap);
	Mojo.Event.listen(this.standard, Mojo.Event.tap, this.standardTap);
	Mojo.Event.listen(this.droppedD, Mojo.Event.tap, this.droppedDTap);
	Mojo.Event.listen(this.pro, Mojo.Event.tap, this.proTap);

	// start in standard tuning
	this.switchTuning("standard");
}

PreAssistant.prototype.activate = function(event) {
}
PreAssistant.prototype.deactivate = function(event) {
}

PreAssistant.prototype.cleanup = function(event) {

	this.myAudioObj = null;

	Mojo.Event.stopListening(this.sixth, Mojo.Event.tap, this.sixthTap);
	Mojo.Event.stopListening(this.fifthString, Mojo.Event.tap, this.fifthTap);
	Mojo.Event.stopListening(this.fourthString, Mojo.Event.tap, this.fourthTap);
	Mojo.Event.stopListening(this.thirdString, Mojo.Event.tap, this.thirdTap);
	Mojo.Event.stopListening(this.secondString, Mojo.Event.tap, this.secondTap);
	Mojo.Event.stopListening(this.firstString, Mojo.Event.tap, this.firstTap);
}

PreAssistant.prototype.mediaSetup = function() {

	// new 1.4.x HTML5 audio implementation setup
	this.libs = MojoLoader.require({name: "mediaextension", version: "1.0"});

	// set the audio object to the audio html tag id
	this.myAudioObj = this.controller.get('audio-nav');

	// get the extension API for the audio object in the scene.
	this.audioExt = this.libs.mediaextension.MediaExtension.getInstance(this.myAudioObj);

	// sound state event handler
	this.mediaHandleEvent = this.mediaHandleEvent.bind(this);
	this.myAudioObj.addEventListener('ended', this.mediaHandleEvent, false);

	this.playing = false;
	this.playingString = 0;

}

PreAssistant.prototype.switchTuning = function(tune) {

	// if a string is already playing, stop the sound
	if (this.playing) {

		// pretend to have hit the same string as is already playing,
		// which causes playMp3 to shut off the sound and remove
		// the on overlay
		this.playMp3(this.myAudioObj.src, 0);

	}

	// locations of mp3s
	switch(tune) {
		case "standard":
			this.sixthmp3 = Mojo.appPath + "audio/6-e.mp3";
			this.fifthmp3 = Mojo.appPath + "audio/5-a.mp3";
			this.fourthmp3 = Mojo.appPath + "audio/4-d.mp3";
			this.thirdmp3 = Mojo.appPath + "audio/3-g.mp3";
			this.secondmp3 = Mojo.appPath + "audio/2-b.mp3";
			this.firstmp3 = Mojo.appPath + "audio/1-e.mp3";
			// turn on standard selection overlay
			this.standardOverlay.style.zIndex = "2";
			this.droppedDOverlay.style.zIndex = "-1";
		break;

		case "droppedD":
			this.sixthmp3 = Mojo.appPath + "audio/6-d.mp3";
			this.fifthmp3 = Mojo.appPath + "audio/5-a.mp3";
			this.fourthmp3 = Mojo.appPath + "audio/4-d.mp3";
			this.thirdmp3 = Mojo.appPath + "audio/3-g.mp3";
			this.secondmp3 = Mojo.appPath + "audio/2-b.mp3";
			this.firstmp3 = Mojo.appPath + "audio/1-e.mp3";
			// turn on droppedD selection overlay
			this.droppedDOverlay.style.zIndex = "2";
			this.standardOverlay.style.zIndex = "-1";
		break;
	}

}

PreAssistant.prototype.mediaHandleEvent = function(event){
	try{
		Mojo.Log.info("PlayAudioAssistant::eventHandlerMedia for event: ", event.type);
		switch(event.type){

			case 'ended':
				// if the sound has ended and has not been stopped by the user
				if(!this.stopped)
					// replay the sound
					this.mediaReplay();
			break;
		}
	}
	catch(e){
		Mojo.Log.error("PlayAudioAssistant::eventHandlerMedia threw: ", Object.toJSON(e));
	}
}



PreAssistant.prototype.sixthTap = function (event) {
	this.playMp3(this.sixthmp3,6);
}

PreAssistant.prototype.fifthTap = function (event) {
	this.playMp3(this.fifthmp3,5);
}

PreAssistant.prototype.fourthTap = function (event) {
	this.playMp3(this.fourthmp3,4);
}

PreAssistant.prototype.thirdTap = function (event) {
	this.playMp3(this.thirdmp3,3);
}

PreAssistant.prototype.secondTap = function (event) {
	this.playMp3(this.secondmp3,2);
}

PreAssistant.prototype.firstTap = function (event) {
	this.playMp3(this.firstmp3,1);
}

PreAssistant.prototype.standardTap = function(event) {
	this.switchTuning("standard");
}

PreAssistant.prototype.droppedDTap = function(event) {
	this.switchTuning("droppedD");
}

PreAssistant.prototype.proTap = function(event) {
	// open app catalog to com.jdfsoftware.tuneyourguitarpro
	new Mojo.Service.Request('palm://com.palm.applicationManager',
		{
			method: "open",
			parameters:
				{
					target: 'http://developer.palm.com/appredirect/?packageid=com.jdfsoftware.tuneyourguitarpro'
				}
		});
}

PreAssistant.prototype.playMp3 = function (file, whichString) {

	// if a sound is playing and it's the button that's been pressed
	// we just want to stop playing and not start again
	if (this.playing && (file == this.myAudioObj.src)) {
		this.myAudioObj.pause();
		this.myAudioObj.src = null;
		this.myAudioObj.load();
		this.playing = false;
		this.playingString = 0;
		// remove "on" overlay
		this.onOverlay.style.zIndex = "-1";
	}

	// otherwise, if the sound is playing but it's a different button
	else if (this.playing) {
		this.myAudioObj.pause();
		this.myAudioObj.src = file;
		this.myAudioObj.load();
		this.myAudioObj.play();
		this.playing = true;
		this.playingString = whichString;
		// change "on" overlay
		this.changeOn(whichString);
	}

	// otherwise, if no sound is playing
	else {			
		this.myAudioObj.src = file;
		this.myAudioObj.load();
		this.myAudioObj.play();
		this.playing = true;
		this.playingString = whichString;
		// create "on" overlay
		this.changeOn(whichString);
	}
}

PreAssistant.prototype.changeOn = function(whichString) {

	switch(whichString) {

		case 6:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "15px";
		break;

		case 5:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "70px";
		break;

		case 4:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "124px";
		break;

		case 3:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "178px";
		break;

		case 2:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "232px";
		break;

		case 1:
			this.onOverlay.style.zIndex = "2";
			this.onOverlay.style.left = "288px";
		break;
	}

}
PreAssistant.prototype.mediaReplay = function() {

	var replayCallback = function() {
				this.isPending = null;
				this.myAudioObj.play();
			     }.bind(this);

	if (this.isPending) {
		Mojo.Log.warn("Playback is already pending");
	}

	else {
		this.isPending = this.controller.window.setTimeout(replayCallback, 1);
	}

}

PreAssistant.prototype.handleCommand = function (event) {

	// handle drop-down menu commands

	this.controller=Mojo.Controller.stageController.activeScene();

	if(event.type == Mojo.Event.command) {	

		switch (event.command) {

			case 'menu-help':
				this.controller.showAlertDialog({
					title: $L("Help"),
					message: $L("Choose your tuning and tap a string, and tune the corresponding string on your guitar to match that sound. Tap the string again to stop the sound, or tap another string to start playing the next note. Do this for all 6 strings. To switch to a different tuning, tap the name of the tuning. To get more tunings, tap the go pro button."),
					choices:[
	         				{label:$L('Ok'), value:"refresh", type:'affirmative'}
					]				    
				});
			break;

			case 'menu-about':
				this.controller.showAlertDialog({
					title: $L("About"),
					message: $L("Tune Your Guitar v0.9.5 Copyright 2010 JDF Software. Contact me at http://www.jdf-software.com http://twitter.com/jdfsoftware or jdfsoftware@gmail.com with any comments or suggestions. I do listen!"),
					choices:[
	         				{label:$L('Ok'), value:"refresh", type:'affirmative'}
					]				    
				});
			break;

			case 'menu-support':
				this.launchSupportEmail();
			break;
		}

	}

}

PreAssistant.prototype.launchSupportEmail = function() {
	this.controller.serviceRequest('palm://com.palm.applicationManager',
					{
						method:'open',
						parameters:{target: 'mailto:jdfsoftware@gmail.com?subject=Tune%20Your%20Guitar%20Support%20v1.0.1'}
					});
}
