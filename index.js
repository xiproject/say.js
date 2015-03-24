'use strict';

var spawn = require('child_process').spawn;
var childD;

var say = exports;
var speakingQueue = [];
var speaking = false;

var psTree = require('ps-tree');
/*
child.kill only kills the child and not the process spawned by it.
Festival calls on aplay to play the speech sound and that is not killed when festival is killed.
*/
var kill = function(pid, signal, callback) {
    signal = signal || 'SIGKILL';
    callback = callback || function() {};
    var killTree = true;
    if (killTree) {
        psTree(pid, function(err, children) {
            [pid].concat(
                children.map(function(p) {
                    return p.PID;
                })
            ).forEach(function(tpid) {
                try {
                    process.kill(tpid, signal);
                } catch (ex) {}
            });
            callback();
        });
    } else {
        try {
            process.kill(pid, signal);
        } catch (ex) {}
        callback();
    }
};


function speak() {
    var commands;
    var pipedData = null;

    if (speakingQueue.length > 0) {
        var dialogue = speakingQueue.splice(0, 1)[0];
        speaking = true;
        if (process.platform === 'darwin') {
            say.speaker = 'say';
            if (!dialogue.voice) {
                commands = [dialogue.text];
            } else {
                commands = ['-v', dialogue.voice, dialogue.text];
            }
        } else if (process.platform === 'linux') {
            if (dialogue.voice === 'google') {
                var url = "http://translate.google.com/translate_tts?tl=en&q=" + dialogue.text;
                say.speaker = 'vlc';
                commands = ['-I', 'rc', '--no-video', '--play-and-exit', url];
            }
            else {
                say.speaker = 'festival';
                commands = ['--pipe'];
                pipedData = '(' + dialogue.voice + ') (SayText \"' + dialogue.text + '\")';

            }
        }
        childD = spawn(say.speaker, commands);

        childD.stdin.setEncoding('ascii');
        childD.stderr.setEncoding('ascii');

        if (pipedData !== null) {
            childD.stdin.end(pipedData);
        }


        childD.stderr.on('data', function(data) {
            console.log(data);
        });
        childD.stdout.on('data', function(data) {
            console.log(data);
        });


        childD.on('exit', function(code, signal) {
            //child was not killed by parent
            childD = null;
            speaking = false;
            speak();
            if (!signal && code !== 0) {
                //if error occured
                console.log('couldnt talk, had an error ' + '[code: ' + code + '] ' + '[signal: ' + signal + ']');
            }
            if (dialogue.callback) {
                dialogue.callback();
            }
        });
    }
}

exports.speak = function(voice, text, callback) {

    if (arguments.length < 2) {
        console.log('invalid amount of arguments sent to speak()');
        return;
    }

    speakingQueue.push({
        voice: voice,
        text: text,
        callback: callback
    });
    if (!speaking)
        speak();
};


exports.stop = function() {
    //if child is alive
    if (childD) {
        kill(childD.pid);
        speakingQueue = [];
    }
};

exports.skip = function() {
    if (childD) {
        kill(childD.pid);
    }
};
