#!/usr/bin/env node
var suite = require('./suite');

// simple suite
suite(id, {
    'foo': 'foo'
});

// expected result as a function
suite(id, {
    'foo': function(op, a) {return op(a);}
});

// suite with "multiple"
suite(lower, suite.multiple(['BAR', 'Bar', 'baR'], 'bar'));

// merged suite
suite(lower, suite.merge(
    {'Foo': 'foo'},
    {'Bar': 'bar'}
));

// nested arrays
suite(nestedArray, {'foo': [[1, 3, 4], [2, 3, 5]]});

// nested objects
suite(nestedObject, {'foo': {first: {name: 'foo'}, second: {name: 'bar'}}});

// key callback
suite(sum, {
    'a,b': 'ab'
}, function(a) {return a.split(',');});

// array syntax
suite(sum, [
    [12, 3], 15,
    [8, 2], 10
]);

suite(id, [
    'a', 'a',
    'b', 'b'
]);

// json output (supposed to fail and print)
suite(id, {
    'foo': [{a: 'bar', children: [{a: 'baz'}]}, {a: 'zob'}]
});

// number generators (QuickCheck)
suite(sum, suite.generate(1000,
    [suite.number(100), suite.number(100)],
    function(op, a, b) {
        // commutativity
        return op(a, b) == op(b, a);
    })
);

// string generators (QuickCheck)
suite(reverse, suite.generate(1000,
    [suite.word(10)],
    function(op, a) {
        // reverse of reverse is input itself
        return op(op(a)) == a;
    })
);

function id(a) {
    return a;
}

function lower(s) {
    return s.toLowerCase();
}

function nestedArray() {
    return [[1, 3, 4], [2, 3, 5]];
}

function nestedObject() {
    return {first: {name: 'foo'}, second: {name: 'bar'}};
}

function sum(a, b) {
    return a + b;
}

function reverse(a) {
    return a.split('').reverse().join('');
}

