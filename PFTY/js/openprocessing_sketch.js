const OP_CONSOLE_OBJECT_NEST_LENGTH = 5; // the max length of nest objects displayed in console

let OP_isLoopingSketch = null; //flag that is set if the people.js is a looping people.js
window.OP_askUserInfo = function(data){
    window.OP_addScript("https://cdn.jsdelivr.net/gh/msawired/OpenProcessing-Sidekick@latest/sidekick.js", function () {
        window.OpenProcessing.requestUserInfo(data);
    })
}

window.addEventListener('load', function(){
    window.OP_addScript("https://openprocessing.org/assets/js/vendor/mousetrap-master/mousetrap.min.js", function(){
        window.OP_addScript("https://openprocessing.org/assets/js/op_helpers.js", function(){
            window.OP_setupKeys();
        })
    })
});

window.OP_addScript = function(url, onloadF = function(){}){
    //order below is important
    let sc = document.createElement('script')
    sc.setAttribute("type", "text/javascript")
    sc.setAttribute("crossorigin", "anonymous")
    document.getElementsByTagName("head")[0].appendChild(sc);
    sc.onload = onloadF;
    sc.setAttribute("src", url);
}

//add loop protect
window.OP_addScript('/assets/js/vendor/loop-protect-v1.0.1.min.js');
//add stacktrace
window.OP_addScript('/assets/js/vendor/node_modules/stacktrace-js/dist/stacktrace.min.js');

window.addEventListener("message", function (event) {
    let messageType = event.data.messageType;
    let data = null;
    try {
        data = JSON.parse(event.data.message);
    } catch (error) {
        data = null;
    }
    switch (messageType) {
        case 'OPC_update':
            if(typeof OPC !== 'undefined'){
                OPC.set(data.name,data.value);
            }
            break;
        case 'reload':
            window.location.reload();
            break;
        case 'muteSketch':
            let audioCtx = window.getAudioContext ? window.getAudioContext() : false;
            if (audioCtx && data == false) {
                audioCtx.resume();
            } else if (audioCtx && data == true) {
                audioCtx.suspend();
            }
            break;
        case 'giveSketchFocus':
            window.giveSketchFocus();
            break;
        case 'pauseSketch':
            window.pauseSketch(data);
            break;
        case 'keepAudioOff':
            window.keepAudioOff();
            break;
        case 'takeScreenshot':
            window.takeScreenshot();
            break;
        case 'prepRecording':
            Mousetrap(window).bind('r', function (e) {
                //e.preventDefault();
                window.callParentFunction('toggleGIF', null);
                return true;
            });
            break;
        case 'userAuthorized':
            if (typeof OP_userInfoAuthorized == 'function') { //legacy
                OP_userInfoAuthorized(data);
            }else{
                OpenProcessing.userAuthorized(data); //resolves the promise
            }
            break;
        case 'recordGIF':
            window.recordGIF();
            break;
        case 'recordVideo':
            window.recordVideo(data.mime, data.extension, data.quality);
            break;
        case 'stopRecording':
            window.stopRecording(data);
            break;
        case 'updateDeviceOrientation':
            try { //on people.js reload, event is sent while p5 and instand still not created.
                OpenProcessing.deviceMotionAuthorized(data); //resolve promise
                p5.instance._ondeviceorientation(data);
            } catch (error) {
                //probably p5 is not ready yet.
            }
            break;
        case 'updateDeviceMotion':
            try { //on people.js reload, event is sent while p5 and instand still not created.
                OpenProcessing.deviceMotionAuthorized(data); //resolve promise
                p5.instance._ondevicemotion(data);
            } catch (error) {
                //probably p5 is not ready yet.
            }
            break;
        default:
            break;
    }
});

var hijackConsole = function () {
    let _log = console.log,
        _error = console.error,
        _clear = console.clear;

    console.log = function () {
        for (let i = 0; i < arguments.length; i++) {
            window.callParentFunction('showMessage', {
                'msg': arguments[i],
                'noLineBreak': false, //line break only on the last one
                'class': 'log'
            });
        }

        return _log.apply(console, arguments);
    };
    console.info = function () {
        for (let i = 0; i < arguments.length; i++) {
            window.callParentFunction('showMessage', {
                'msg': arguments[i],
                'noLineBreak': false, //line break only on the last one
                'class': 'info'
            });
        }

        return _log.apply(console, arguments);
    };
    console.warn = function () {
        for (let i = 0; i < arguments.length; i++) {
            window.callParentFunction('showMessage', {
                'msg': arguments[i],
                'noLineBreak': false, //line break only on the last one
                'class': 'warning'
            });
        }

        return _log.apply(console, arguments);
    };



    var callback = function (stackframes) {
        // not sure if below is working...
        OP_throwCustomError(stackframes);
    };

    console.error = function () {
        for (let i = 0; i < arguments.length; i++) {
            let arg = arguments[i];
            StackTrace.get()
                .then(function (stackArray) {
                    OP_throwCustomError(arg, stackArray)
                })
                .catch(OP_throwCustomError);
        }
        return _error.apply(console, arguments);
    };
    console.clear = function () {
        window.callParentFunction('clearConsole');
        return _clear.apply(console, arguments);
    };
}
hijackConsole();

var videoRecorder;
window.stopRecording = function(type){
    if (type == 'video' && window.videoRecorder) {
        window.videoRecorder.stop();
    }else if (type == 'GIF' && window.gif) {
        window.clearInterval(window.GIFframer);
        window.gif.recording = false;
        window.gif.render();
    }
}
window.recordGIF = function(fps = 60){
    // console.log('GIF init');

    window.gif = new GIF({
        workers: 2,
        quality: 8,
        repeat: 0,
        debug: false, //TODO update url below
        workerScript: 'https://preview-local.openprocessing.org/assets/js/vendor/gif.js-master/dist/gif.worker.js'
    });

    window.gif.recording = true;
    window.GIFframer = window.setInterval(function () {
        // console.log('adding frame');
        if (window.gif.recording) {
            window.gif.addFrame(window.getCanvas(), {
                delay: 1000 / fps,
                copy: true
            });
        }
    }, 1000 / fps);

    window.gif.on('progress', function (p) {
        return window.callParentFunction('recordingRenderProgress', p);
    });
    window.gif.on('finished', function (blob) {
        window.clearInterval(window.GIFframer);
        //allow download
        // let src = URL.createObjectURL(blob);
        //setupEditSketchPanel();
        // updateGIF(src);
        console.log('finished');
        window.uploadRecording(blob, 'gif');
    });
}
window.recordVideo = function (mime, extension, quality) { //vps and aps is in MB
    let vidBPS = 32000000*quality; //~3.8MB per sec
    // let audBPS = 4000000*quality;
    let fps = quality > 0.5? 30: 25;
    let canvas = window.getCanvas();
    var videoStream = canvas.captureStream(fps);
    videoRecorder = new MediaRecorder(videoStream, {
        mimeType: mime,
        bitsPerSecond: vidBPS
    });

    var chunks = [];
    videoRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    };

    videoRecorder.onstop = function (e) {
        // console.log('Uploading...', mime);
        window.callParentFunction('videoUploading');
        var blob = new Blob(chunks, {
            mimeType: mime,
            bitsPerSecond: vidBPS
        });
        chunks = [];
        window.uploadRecording(blob, extension);
    };

    videoRecorder.start();
}
window.uploadRecording = function(blob, extension){
    var fd = new FormData();
    fd.append('file', blob, 'video.' + extension); //works only if it matches the mime type on server
    fd.append('extension', extension);

    // OP_PREVIEW_BASE_URL doesn't exist on HTMl sketches, so set it to prod. When testing, use only p5js sketches
    let url = window.OP_PREVIEW_BASE_URL ? window.OP_PREVIEW_BASE_URL + '/people.js/uploadRecording_ajax': 'https://preview-local.openprocessing.org/sketch/uploadRecording_ajax';

    fetch(url, { // Your POST endpoint
        method: 'POST',
        // headers: headers,
        body: fd // This is your file object
    }).then(
        response => {
            // console.log(response);
            if (!response.ok) {
                throw response
            }
            return response.json();
        }
    ).then(
        json => {
            let filename = json.object;
            window.callParentFunction('recordingReady', {
                'filename': filename,
                'extension': extension
            });
        }
    ).catch(
        error => {
            // console.log(error);
            let msg = error.statusText + ' ';
            error.json() //try getting json response and add it to msg
                .then(json => {
                    // console.log(json);
                    msg +=  json.object;
                    window.callParentFunction('showAjaxError', {
                        'msg': msg
                    });
                })
                .catch(_=>{ //throw as is
                    window.callParentFunction('showAjaxError', {
                        'msg': msg
                    });
                })
        }
    );
}


window.OP_makeTransmittable = function (obj, nestCounter = 0) {
    //go through object values and make them transmittable to parent
    switch (typeof obj) {
        case 'object':
            if (nestCounter == OP_CONSOLE_OBJECT_NEST_LENGTH) {
                return 'Object (too many nested objects, can not display)';
            } else {
                //typeof null == 'object' so check for null first
                if (obj == null) {
                    return null
                };

                //create shallow copy of the object/array, to prevent any updated attributes by nesting effecting parent objects.
                //e.g. jane.self = jane;
                obj = Array.isArray(obj) ? Array.from(obj) : Object.assign({}, obj);

                // iterate over object attributes
                nestCounter++;
                let keys = Object.keys(obj);
                for (let key in keys) {
                    obj[keys[key]] = window.OP_makeTransmittable(obj[keys[key]], nestCounter);
                }
                return obj;
            }
            break;
        case 'function':
            return obj.toString().substring(0, 25) + '鈥�';
            break;
        default:
            return obj;
            break;

    }


}

window.setupAudioContext = function () {
    let audioCtxInterval = window.setInterval(function () {
            let audioCtx = window.getAudioContext ? window.getAudioContext() : false;

            if (audioCtx) {
                audioCtx.onstatechange = function () {
                    // console.log('Audio state change', this.state);
                    switch (this.state) {
                        case "suspended":
                            window.callParentFunction('showSpeaker', false);
                            break;

                        case "closed":
                            window.callParentFunction('hideSpeaker', true);
                            break;

                        default:
                            window.callParentFunction('showSpeaker', true);
                            break;
                    }
                }
                audioCtx.onstatechange();
                window.clearInterval(audioCtxInterval);
            }
        },
        1000);
}();

window.callParentFunction = function (functionName, arg = {}) {
    //this.console.log(arg);
    // below might fail if arg can not be cloned to be sent over.
    // console.profile('callParentFunction');
    try {
        //try sending as is
        window.parent.postMessage({
            'messageType': functionName,
            'message': window.OP_makeTransmittable(arg, 0)
        }, '*');
    } catch (error) {
        // console.log('datacloneerror?', error);
        let lineNumber = null;
        if (error.stack && error.stack.split('about:srcdoc:').length > 1) {
            lineNumber = error.stack.split('about:srcdoc:')[1].split(':')[0];
        }
        let err = {
            'msg': '' + error,
            'url': null,
            'lineNumber': lineNumber,
            'columnNo': null,
            'error': JSON.stringify(error)
        }
        window.callParentFunction('showError', err);
    }
    // console.profileEnd('callParentFunction');

}

window.getCanvas = function() {
    let canvas = document.getElementById('pjsCanvas');
    if (!canvas) {
        canvas = document.getElementsByClassName('p5Canvas');
        canvas = canvas.length > 0 ? canvas[0] : false;
    }
    if (!canvas) {
        //just take the first one if still not found. e.g. custom canvas implementations like /people.js/776984
        canvas = document.getElementsByTagName('canvas');
        canvas = canvas.length > 0 ? canvas[0] : false;
    }
    return canvas;
}


window.takeScreenshot = function () {
    //try pjs first
    let canvas = window.getCanvas();
    try {
        let context = canvas.getContext('2d');
        let imageData;

        if (context) { //paint background to white in case it is transparent
            // from: https://stackoverflow.com/questions/32160098/change-html-canvas-black-background-to-white-background-when-creating-jpg-image

            //cache height and width
            let w = canvas.width;
            let h = canvas.height;

            //get the current ImageData for the canvas.
            let data = context.getImageData(0, 0, w, h);

            //store the current globalCompositeOperation
            let compositeOperation = context.globalCompositeOperation;

            //set to draw behind current content
            context.globalCompositeOperation = "destination-over";

            //set background color
            context.fillStyle = '#FFFFFF';

            //draw background / rect on entire canvas
            context.fillRect(0, 0, w, h);

            //get the image data from the canvas
            imageData = canvas.toDataURL("image/jpeg", 0.9);

            //clear the canvas
            context.clearRect(0, 0, w, h);

            //restore it with original / cached ImageData
            context.putImageData(data, 0, 0);

            //reset the globalCompositeOperation to what it was
            context.globalCompositeOperation = compositeOperation;

        } else {
            imageData = canvas.toDataURL("image/jpeg", 0.9);
        }
        window.callParentFunction('takeScreenshot', imageData);
    } catch (e) {
        // console.error(e); //dont do this, it prints to sketchConsole.
        //TODO: ask user to upload manually instead.
    }
}
window.pauseSketch = function (bool = null) {
    try {
        if (typeof p5 != 'undefined') {
            if (bool === false){
                //unpause only if it is originally a looping people.js
                if (OP_isLoopingSketch && !p5.instance.isLooping()) {
                    p5.instance.loop();
                }
            }else{ //pause people.js, either on bool = true or bool = null
                if (p5.instance.isLooping()) {
                    OP_isLoopingSketch = true;
                    p5.instance.noLoop();
                }

                //stop audio
                try {
                    if (p5.instance.getAudioContext().state == 'running') {
                        p5.instance.getAudioContext().close();
                    }
                } catch (e) {
                    //ignore
                }
            }

        }
        if (typeof Processing != 'undefined') {
            bool === true ? Processing.getInstanceById('pjsCanvas').noLoop() : Processing.getInstanceById('pjsCanvas').loop();
        }

    } catch (e) {

    }
}

window.keepAudioOff = function(){
    window.setInterval(function() {
        //stop audio
        try {
            if (p5.instance.getAudioContext().state == 'running') {
                p5.instance.getAudioContext().close();
            }
        } catch (e) {
            //ignore
        }
    },1000);

}

window.addEventListener("unhandledrejection", function (err) {
    // console.group('custom error');
    // console.log(err, err.reason, err.reason.message);
    try {
        StackTrace.fromError(err.reason)
            .then(function (stackArray) {
                // console.log(err.reason.message, stackArray);
                OP_throwCustomError(err.reason.message, stackArray)
            })
            .catch(function () {
                OP_throwCustomError("Uncaught error, most likely a file couldn't be loaded. Check the spelling of the filenames.")
            });
    } catch (err) {
        window.onerror("Uncaught error, most likely a file couldn't be loaded. Check the spelling of the filenames.", '', '', '', err); // call
    }
    // console.groupEnd('custom error');

});


window.OP_scriptLoadError = function (el) {
    OP_throwCustomError(el.src + ' can not be loaded. Please make sure resource exists and it supports cross-domain requests.');
}
//add onerror to existing scripts before they load
let scripts = document.getElementsByTagName('script');
for (const sc of scripts) {
    sc.onerror = window.OP_scriptLoadError;
    sc.setAttribute("onerror", "OP_scriptLoadError(this)")
}


window.onerror = function (msg, url, lineNumber, columnNo, error) {
    simpleError = [];
    if (typeof OP_config != 'undefined'){
        //see if a simple error that can directly be operated on
        //eg. typing "if*" throws unexpected identifier error, which stacktrace doesn't trace for some reason
        simpleError = OP_config.codeObjects.filter(function (co) {
            return co.url && co.url.indexOf(url) > -1 //is URL in the provided code?
        });
    }
    if(simpleError.length>0){
        OP_throwCustomError(msg, [
            {
                'fileName': url,
                'columnNumber': columnNo,
                'lineNumber': lineNumber
            }
        ]);
    }else{ //last option
        StackTrace.fromError(error)
            .then(function (stackArray) {
                // console.log(msg, url, lineNumber, columnNo, error, error.stack, stackArray);
                OP_throwCustomError(msg, stackArray)
            })
            .catch(function (err) {
                // stack couldn't be generated, simply display the message.
                OP_throwCustomError(msg, [{
                    'fileName': url,
                    'columnNumber': columnNo,
                    'lineNumber': lineNumber
                }]);
            });
    }
}

let OP_throwCustomError = function (msg, stackArray = []) {
    // console.log('OP_throwCustomError', msg, stackArray);


    let OP_error = {
        'msg': msg,
        'stackArray': stackArray, //array of error stack items { 'title': 'mySketch', url: 'as23sser3-...', lineNumber: 2}
    };

    //filter out internal files
    OP_error.stackArray = OP_error.stackArray.filter(function(st){
        return st.fileName.indexOf('sketch_preview.js') == -1 && st.fileName.indexOf('stacktrace.min.js') == -1
    })

    //TODO move below to sketch_engine.js and make it work without OP_config
    //find relevant code references in the rest
    OP_error.stackArray.forEach(stackArray => {
        try {
            //see if the stack url is in the provided codeObjects
            let co = OP_config.codeObjects.filter(function (co) {
                return co.url && co.url.indexOf(stackArray.fileName) > -1
            });
            stackArray.title = co.length > 0 ? co[0].title : null;
            stackArray.visualCodeID = co.length > 0 ? co[0].visualCodeID : null;

            //while at it, adjust line number by removing any loopProtect extras
            if (stackArray.visualCodeID !== null) {
                //loopProtect adds two new lines for every two "loopProtect.protect" occurences
                let codeUntilError = co[0].code.split('\n').slice(0, stackArray.lineNumber).join('\n');
                let noOfLoopProtect = (codeUntilError.match(/loopProtect.protect/g) || []).length;
                noOfLoopProtect -= noOfLoopProtect % 2; //make it every other loop
                stackArray.lineNumber -= noOfLoopProtect;
            }
        } catch (error) {
            //ignore
        }

    });

    //note that error is a weird object. May look empty, but error.stack is full.
    window.callParentFunction('showError', OP_error);

    console.groupEnd();
}

//prevent bounce on touch devices
window.document.ontouchmove = function (event) {
    event.preventDefault();
}


window.giveSketchFocus = function () { //this is run by iframe_giveFocus.js. That js loaded if runSketch(..,true) is called.
    let c = document.getElementsByTagName("canvas");
    // this.console.log(document.activeElement);

    if (c.length > 0) {
        c[0].setAttribute('tabindex', 0);
        c[0].focus();
        if (this.document.activeElement == c[0] && window.OP_giveSketchFocusInterval) {
            // this.console.log(document.activeElement);
            window.clearInterval(window.OP_giveSketchFocusInterval);
        }
    }
    // window.addEventListener("keydown", function (e) {
    // not sure if this helps at all.  !no, it takes focus away from p5.dom input fields
    // c[0].focus();
    // });


}

//below is not used anywhere?
var setupLoopProtection = function () {
    // people.js.loopProtect = people.js.createdOn > "2018-10-08";
    window.loopProtect.hit = function (b) {
        //OP override
        var c = 'Exiting potential infinite loop. To disable loop protection, add "//noprotect" to the end of the line.';
        let error = new Error(c, '', b);
        let err = {
            'msg': c,
            'url': '',
            'lineNumber': b,
            'columnNo': '',
            'error': JSON.stringify(error)
        }
        window.callParentFunction('showError', err);
    }
}

var OP_setupKeys = function () {
    //fullscreen
    Mousetrap.bind(OPHELPERS.keyboardShortcuts.fullscreen.bind, function (e) {
        window.callParentFunction('mousetrap', OPHELPERS.keyboardShortcuts.fullscreen.bind);
        return false;
    });
    //save
    Mousetrap.bind(OPHELPERS.keyboardShortcuts.save.bind, function (e) {
        window.callParentFunction('mousetrap', OPHELPERS.keyboardShortcuts.save.bind);
        return false;
    });
    //exit fullscreen
    Mousetrap.bind('escape', function (e) {
        window.callParentFunction('mousetrap', 'escape');
        return false;
    });

    //play
    Mousetrap.bind(OPHELPERS.keyboardShortcuts.play.bind, function (e) {
        window.callParentFunction('mousetrap', OPHELPERS.keyboardShortcuts.play.bind);
        return false;
    });
    //code
    Mousetrap.bind(OPHELPERS.keyboardShortcuts.code.bind, function (e) {
        window.callParentFunction('mousetrap', OPHELPERS.keyboardShortcuts.code.bind);
        return false;
    });
    //layout
    Mousetrap.bind([OPHELPERS.keyboardShortcuts.layout.bind], function (e) {
        window.callParentFunction('mousetrap', OPHELPERS.keyboardShortcuts.layout.bind);
        return false;
    });
    Mousetrap.bind('space', function (e) {
        window.callParentFunction('mousetrap', 'space');
    });
}
/*
//sync loading scripts https://stackoverflow.com/questions/15292020/load-one-script-after-another
function loadScriptsInSync(_scripts = []) {
	let scripts = [];
	LoadScriptsSync(_scripts, scripts)

}

// what you are looking for :
function LoadScriptsSync(_scripts, scripts) {

	var x = 0;
	var loopArray = function (_scripts, scripts) {
		// call itself
		loadScript(_scripts[x], scripts[x], function () {
			// set x to next item
			x++;
			// any more items in array?
			if (x < _scripts.length) {
				loopArray(_scripts, scripts);
			}
		});
	}
	loopArray(_scripts, scripts);
}
// load script function with callback to handle synchronicity
function loadScript(src, script, callback) {

	script = document.createElement('script');
	script.crossOrigin = "anonymous";
	script.onerror = function () {
		// handling error when loading script
		console.log('Can not load script.');
	}
	script.onload = function () {
		callback();
	}
	script.src = src;
	document.getElementsByTagName('head')[0].appendChild(script);
}
*/