var assert = require('assert');
var util = require('util');
var funkit = require('funkit');
var is = require('is-js');

var suite = function(f, tests) {
    if(is.array(tests)) runTests(f, tests, f.async? asyncTest: test);
    else if(is.fn(tests)) runTests(f, generateTests(f, tests, suite._generator, suite._amount || 10), test);
    else assert.ok(false, 'Invalid test function');
};

function runTests(f, tests, testFunc) {
    for(var i = 0, len = tests.length; i < len; i += 2) {
        testFunc(tests[i], tests[i + 1], f);
    }
}

// TODO: in case certain preconditions are fixed, might want to generate just one
// test for that
function generateTests(f, precondition, generator, amount) {
    var preconditions = f._preconditions;
    var tests = [];

    if(!is.array(preconditions)) return [];

    preconditions.maxLen = maxLen(preconditions);

    for(var i = 0; i < amount; i++) {
        tests.push(generateTest(f, preconditions, generator));
        tests.push(precondition);
    }

    return tests;
}

function maxLen(a) {
    return a.map(function(v) {return v.length;}).sort(function(a, b) {return a < b;})[0];
}

function generateTest(f, preconditions, generator) {
    var params;
    var param;
    var precondition = funkit.math.choose(preconditions);
    var inv;

    while(!isOk(f, params)) {
        params = [];

        for(var i = 0; params.length < preconditions.maxLen; i++) {
            inv = precondition[i];

            if(is.fn(inv)) params.push(generator());
            else params.push(is.set(inv)? inv: generator());
        }
    }

    return params;
}

function isOk(f, params) {
    var oldWarn = console.warn;
    var warnings = [];

    if(!params) return;

    console.warn = function(a) {
        warnings.push(a);
    };

    f.apply(null, params);

    console.warn = oldWarn;

    return !warnings.length;
}

function asyncTest(k, o, f) {
    checkAsyncAssertion(k, o, f);
}

function checkAsyncAssertion(k, o, f) {
    var a = is.array(k)? k: [k];
    f.apply(null, a.concat(cmp));

    function cmp(err, r) {
        check(r, o);
    }
}

function test(k, o, f) {
    if(is.fn(o)) {
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
    var r = f.apply(null, is.array(k)? k: [k]);

    check(r, o);
}

function check(r, o) {
    assert.ok(funkit.ops.equals(r, o), util.inspect(r) + ', ' + util.inspect(o) + ' not equal!');
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
    return funkit.math.range(amount).map(function() {
        return [getParams(), check];
    }).reduce(function(a, b) {return a.concat(b);});

    function getParams() {
        return generators.map(function(g) {return g();});
    }
};

suite.multiple = function(keys, value) {
    var ret = [];

    keys.forEach(function(k) {
        ret.push(k);
        ret.push(value);
    });

    return ret;
};

module.exports = suite;
