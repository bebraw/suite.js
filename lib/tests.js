#!/usr/bin/env node
var g = require('generators.js');
var suite = require('./suite');
var funkit = require('funkit');

var id = funkit.id;

var AssertionError = require('assert').AssertionError;

// exception handling
suite(id, [
    'foo', suite.exception(AssertionError, 'bar')
]);

// undefined should fail as well
try {
    suite(undefined);
}
catch (e) {}

// expected result as a function
suite(id, [
    'foo', function(op, a) {return op(a);}
]);

// suite with "multiple"
suite(funkit.lower, suite.multiple(['BAR', 'Bar', 'baR'], 'bar'));

// nested arrays
suite(nestedArray, [
    'foo', [[1, 3, 4], [2, 3, 5]]
]);
function nestedArray() {return [[1, 3, 4], [2, 3, 5]];}

// nested objects
suite(nestedObject, [
    'foo', {first: {name: 'foo'}, second: {name: 'bar'}}
]);
function nestedObject() {return {first: {name: 'foo'}, second: {name: 'bar'}};}

// json output (supposed to fail and print!)
try {
    suite(id, [
        'foo', [{a: 'bar', children: [{a: 'baz'}]}, {a: 'zob'}]
    ]);
}
catch (e) {}

// async
suite(suite.async(asyncFunc), [
    1, 1,
    'foo', 'foo',
    [[1, 2, 3]], [1, 2, 3]
]);

function asyncFunc(data, done) {
    done(null, data);
}

// generators (QuickCheck)
suite(funkit.sum, suite.generate(1000, [g.number(100), g.number(100)], commutativity));
suite(funkit.reverse, suite.generate(1000, [g.word(10)], reversability));

function commutativity(op, a, b) {
    if(isNaN(a) && isNaN(b)) return true; // NaN == evaluates as false always
    return op(a, b) == op(b, a);
}

function reversability(op, a) {
    return op(op(a)) == a;
}

// see generators.js for more
