var assert = require('assert');

var suite = function(f, tests, kCb) {
    kCb = kCb || function(k) {return k;};

    for(var k in tests) {
        var o = tests[k];
        var r = f(kCb(k));

        try {
            assert.ok(equals(r, o));
        }   
        catch (e) {
            console.log('Expected:', o, '\nReceived:', r); 
        }   
    }   
};

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

// http://andrewpeace.com/javascript-is-array.html
function isArray(input) {
    return typeof(input)=='object'&&(input instanceof Array);
}

// http://phpjs.org/functions/is_object:450
function isObject(mixed_var) {
    if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
            return false;
    }   
    return mixed_var !== null && typeof mixed_var == 'object';
}

