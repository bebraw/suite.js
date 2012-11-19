var assert = require('assert');
var funkit = require('funkit');
var util = require('util');

var suite = function(f, tests) {
    if(!funkit.isFunction(f)) {
        assert.ok(false, 'Invalid test function');
    }

    if(funkit.isArray(tests)) {
        var testFunc = f.async? asyncTest: test;

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

        function cmp(err, r) {
            check(r, o);
        }
    }

    function test(k, o) {
        if(funkit.isFunction(o)) {
            if(o.exception) checkException(k, o);
            else checkFunction(k, o);
        }
        else checkAssertion(k, o);
    }

    function checkException(k, o) {
        var ex;

        try {
            checkAssertion(k, o());
        }
        catch (e) {
            ex = e;
        }
        finally {
            if(!ex || ex.name != o.exception.name) {
                console.log('Did not raise ' + o.exception.name + '!');
            }
        }
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
        assert.ok(funkit.equals(r, o), util.inspect(r) + ', ' + util.inspect(o) + ' not equal!');
    }
};

suite.async = function(fn) {
    fn.async = true;

    return fn;
};

suite.exception = function(ex, exp) {
    var ret = function() {
        return exp;
    };
    ret.exception = ex;

    return ret;
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
