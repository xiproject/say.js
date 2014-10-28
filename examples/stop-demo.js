#!/usr/bin/env node

'use strict';

var say = require('../');

// no callback, fire and forget
say.speak('voice_default', 'Hey Jude dont make it bad. When you try your best and you don\'t succed');
// no callback, fire and forget
say.speak('voice_default', 'Take a sad song and make it better');
setTimeout(say.stop, 1000);
say.speak('voice_default', 'Remember to let her into your heart');

