var assert = require('assert');
var funkit = require('funkit');

var suite = function(f, tests, opts) {
    if(funkit.isArray(tests)) {
        var testFunc = opts && opts.async? asyncTest: test;

        for(var i = 0, len = tests.length; i < len; i += 2) {
            testFunc(tests[i], tests[i + 1]);
        }
    }

    function asyncTest(k, o) {
        checkAsyncAssertion(k, o);
    }

    function checkAsyncAssertion(k, o) {
        var a = funkit.isArray(k)? k: [k];
        f.apply(null, a.concat(cmp));

        function cmp(r) {
            check(r, o);
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

        check(r, o);
    }

    function check(r, o) {
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
