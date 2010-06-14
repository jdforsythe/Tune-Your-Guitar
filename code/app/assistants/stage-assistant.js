function StageAssistant() {
}

StageAssistant.prototype.setup = function() {

	// default to Pre

	//	this.controller.pushScene({name: "pre"});

	if (Mojo.Environment.DeviceInfo.screenHeight < 480) {
		this.controller.pushScene({name: "pixi"});
	}

	else {
		this.controller.pushScene({name: "pre"});
	}

}
