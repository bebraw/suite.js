var assert = require('assert');
var funkit = require('funkit');

var suite = function(f, tests) {
    if(funkit.isArray(tests)) {
        for(var i = 0, len = tests.length; i < len; i += 2) {
            test(tests[i], tests[i + 1]);
        }
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
        var r = f.apply(null, funkit.isArray(k)? k: [k]);
 
        try {
            assert.ok(funkit.equals(r, o));
        }   
        catch (e) {
            console.log('Expected: %j', o);
            console.log('Received: %j', r); 
        }   
    }
};

suite.generate = function(amount, generators, check) {
    return funkit.range(amount).map(function() {
        return [getParams(), check];
    }).reduce(function(a, b) {return a.concat(b);});

    function getParams() {
        return generators.map(function(g) {return g();});
    }
};

suite.multiple = function(keys, value) {
    var ret = {}; 

    keys.forEach(function(k) {
        ret[k] = value;
    }); 

    return ret;
};

module.exports = suite;
