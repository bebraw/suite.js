var assert = require('assert');
var funkit = require('funkit');
var util = require('util');

var suite = function(f, tests) {
    if(!funkit.isFunction(f)) {
        assert.ok(false, 'Invalid test function');
    }

    if(funkit.isArray(tests)) {
        var testFunc = f.async? asyncTest: test;

        runTests(f, tests, f.async? asyncTest: test);
    }

    if(funkit.isFunction(tests)) {
        runTests(f, generateTests(f, tests, suite._generator, suite._amount || 10), test);
    }
};

function runTests(f, tests, testFunc) {
    for(var i = 0, len = tests.length; i < len; i += 2) {
        testFunc(tests[i], tests[i + 1], f);
    }
}

// TODO: in case certain invariants are fixed, might want to generate just one
// test for that
function generateTests(f, invariant, generator, amount) {
    var invariants = f._invariants;
    var tests = [];

    if(!funkit.isArray(invariants)) return [];

    invariants.maxLen = maxLen(invariants);

    for(var i = 0; i < amount; i++) {
        tests.push(generateTest(invariants, generator));
        tests.push(invariant);
    }

    return tests;
}

function maxLen(a) {
    return a.map(function(v) {return v.length;}).sort(function(a, b) {return a < b;})[0];
}

function generateTest(invariants, generator) {
    var params = [];
    var param;
    var invariant = funkit.choose(invariants);
    var inv;
    var i = 0;

    while(params.length < invariants.maxLen) {
        inv = invariant[i];

        if(funkit.isFunction(inv)) {
            param = generator();

            if(checkInvariants(inv, param) && inv(param)) {
                params.push(param);
                i++;
            }
        }
        else {
            params.push(funkit.isDefined(inv)? inv: generator());
            i++;
        }
    }

    return params;
}

function checkInvariants(f, val) {
    if(!f._invariants) return true;

    return f._invariants.filter(function(inv) {
        if(inv._invariants) return checkInvariants(inv, val);
        else return checkInvariant(inv, val);
    }).length > 0;
}

function checkInvariant(inv, val) {
    return inv.filter(function(v) {
        return funkit.isFunction(v)? v(val): true;
    }).length == inv.length;
}

function asyncTest(k, o, f) {
    checkAsyncAssertion(k, o, f);
}

function checkAsyncAssertion(k, o, f) {
    var a = funkit.isArray(k)? k: [k];
    f.apply(null, a.concat(cmp));

    function cmp(err, r) {
        check(r, o);
    }
}

function test(k, o, f) {
    if(funkit.isFunction(o)) {
        if(o.exception) checkException(k, o, f);
        else checkFunction(k, o, f);
    }
    else checkAssertion(k, o, f);
}

function checkException(k, o, f) {
    var ex;

    try {
        checkAssertion(k, o(), f);
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

function checkFunction(k, o, f) {
    var r = o.apply(null, [f].concat(k));

    if(!r) console.log('Invariant failed with', k, 'at', o);
}

function checkAssertion(k, o, f) {
    var r = f.apply(null, funkit.isArray(k)? k: [k]);

    check(r, o);
}

function check(r, o) {
    assert.ok(funkit.equals(r, o), util.inspect(r) + ', ' + util.inspect(o) + ' not equal!');
}

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
