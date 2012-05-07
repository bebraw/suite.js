#!/usr/bin/env node
var g = require('generators.js');
var suite = require('./suite');

// simple suite (supposed to fail)
suite(id, [
    'foo', 'bar'
]);

// expected result as a function
suite(id, [
    'foo', function(op, a) {return op(a);}
]);

// suite with "multiple"
suite(lower, suite.multiple(['BAR', 'Bar', 'baR'], 'bar'));

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
suite(id, [
    'foo', [{a: 'bar', children: [{a: 'baz'}]}, {a: 'zob'}]
]);

// async
suite(asyncFunc, [
    1, true,
    2, false
], {async: true});

function asyncFunc(i, done) {
    var ret = i == 1? true: false;

    done(ret);
}

// Generators (QuickCheck)

// number generators
suite(sum, suite.generate(1000,
    [g.number(100), g.number(100)],
    function(op, a, b) {
        // commutativity
        return op(a, b) == op(b, a);
    })
);

// string generators
suite(reverse, suite.generate(1000,
    [g.word(10)],
    function(op, a) {
        // reverse of reverse is input itself
        return op(op(a)) == a;
    })
);

// see generators.js for more

// utility funcs
function id(a) {
    return a;
}

function lower(s) {
    return s.toLowerCase();
}

function sum(a, b) {
    return a + b;
}

function reverse(a) {
    return a.split('').reverse().join('');
}

