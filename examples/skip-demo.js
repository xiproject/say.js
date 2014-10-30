#!/usr/bin/env node

'use strict';
var os = require('os');
var say = require('../');
var voice;
if(os.platform() === 'linux'){
    voice = "voice_default";
}
else if( os.platform() === 'darwin'){
    voice = "Vicki";
}

// no callback, fire and forget
say.speak(voice, 'Hey Jude dont make it bad. When you try your best and you don\'t succed');

// no callback, fire and forget
say.speak(voice, 'Take a sad song and make it better');
setTimeout(say.skip, 1000);
say.speak(voice, 'Remember to let her into your heart');

