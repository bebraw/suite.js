var assert = require('assert');
var funkit = require('funkit');

var suite = function(f, tests, kCb) {
    kCb = kCb || function(k) {return funkit.isArray(k)? k: [k];};

    if(funkit.isArray(tests)) {
        for(var i = 0, len = tests.length; i < len; i += 2) {
            test(tests[i], tests[i + 1]);
        }
    }

    if(funkit.isObject(tests)) {
        for(var k in tests) test(k, tests[k]);
    }

    function test(k, o) {
        if(funkit.isFunction(o)) checkFunction(k, o);
        else checkAssertion(k, o);
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

suite.merge = function(a, b) {
    var ret = {}; 

    for(var k in a) ret[k] = a[k];
    for(k in b) ret[k] = b[k];

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

    if(funkit.isArray(a) && funkit.isArray(b)) return checkArray(a, b) && checkArray(b, a); 
    if(funkit.isObject(a) && funkit.isObject(b)) return checkObject(a, b) && checkObject(b, a); 

    return a === b;
}
