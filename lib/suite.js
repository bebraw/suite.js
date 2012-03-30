var assert = require('assert');

var suite = function(f, tests, kCb) {
    kCb = kCb || function(k) {return isArray(k)? k: [k];};

    if(isArray(tests)) {
        for(var i = 0, len = tests.length; i < len; i += 2) {
            test(tests[i], tests[i + 1]);
        }
    }

    if(isObject(tests)) {
        for(var k in tests) {
            test(k, tests[k]);
        }
    }

    function test(k, o) {
        if(isFunction(o)) {
            checkFunction(k, o);
        }
        else {
            checkAssertion(k, o);
        }
    }

    function checkFunction(k, o) {
        var r = o.apply(null, [f].concat(k));

        if(!r) console.log('Invariant failed with', k, '!');
    }

    function checkAssertion(k, o) {
        var r = f.apply(null, kCb(k));
 
        try {
            assert.ok(equals(r, o));
        }   
        catch (e) {
            console.log('Expected: %j', o);
            console.log('Received: %j', r); 
        }   
    }
};

suite.generate = function(amount, generators, check) {
    var ret = [];

    for(var i = 0; i < amount; i++) {
        ret.push(getParams());
        ret.push(check);
    }

    function getParams() {
        return generators.map(function(g) {return g();});
    }

    return ret;
};

suite.number = function(maxValue) {
    maxValue = maxValue || Number.MAX_VALUE;

    return function() {
        return (Math.random() * maxValue - maxValue / 2) * 2;
    };
};

suite.word = function(maxLen) {
    maxLen = maxLen || 100;

    return function() {
        var ret = '';

        for(var i = 0; i < maxLen; i++) ret += suite.char();

        return ret;
    };
};

suite.char = function() {
    return String.fromCharCode(random(33, 126));
};

suite.upperChar = function() {
    return String.fromCharCode(random(65, 90));
};

suite.lowerChar = function() {
    return String.fromCharCode(random(97, 122));
};

suite.structure = function() {
    function recursion(pick) {
        if(isObject(pick)) {
            pick[suite.word(random(1, 10))()] = recursion(_choose());
        }
        if(isArray(pick)) {
            pick.push(recursion(_choose()));
        }
        return pick;
    }

    function _choose() {
        return choose(getOpts());
    }

    function getOpts() {
        return [{}, [], suite.char(), suite.number()()];
    }

    return recursion(_choose());
};

function random(min, max) {
    return Math.ceil(Math.random() * (max + 1 - min)) - 1 + min;
}

function choose(m) {
    return m[random(0, m.length - 1)];
}

suite.merge = function(a, b) {
    var ret = {}; 

    for(var k in a) {ret[k] = a[k];}
    for(k in b) {ret[k] = b[k];}

    return ret;
};

suite.multiple = function(keys, value) {
    var ret = {}; 

    keys.forEach(function(k) {
        ret[k] = value;
    }); 

    return ret;
};

suite.equals = equals;

module.exports = suite;

// http://stackoverflow.com/questions/201183/how-do-you-determine-equality-for-two-javascript-objects
function equals(a, b) {
    function checkArray(n, m) {
        for(var i = 0, len = n.length; i < len; i++) {
            if(!equals(n[i], m[i])) return false;
        }   

        return true;
    }   

    function checkObject(n, m) {
        for(var i in n) {
            if(n.hasOwnProperty(i)) {
                if(!m.hasOwnProperty(i)) return false;
                if(!equals(n[i], m[i])) return false;
            }   
        }   

        return true;
    }   

    if(isArray(a) && isArray(b)) return checkArray(a, b) && checkArray(b, a); 
    if(isObject(a) && isObject(b)) return checkObject(a, b) && checkObject(b, a); 

    return a === b;
}

function isArray(input) {
    return Array.isArray(input);
}

function isFunction(input) {
    return typeof input === "function";
}

function isObject(input) {
    return typeof input === "object";
}

// http://phpjs.org/functions/is_object:450
function isObject(mixed_var) {
    if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
            return false;
    }   
    return mixed_var !== null && typeof mixed_var == 'object';
}

