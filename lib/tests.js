#!/usr/bin/env node
var suite = require('./suite');


// simple suite
suite(id, {
    'foo': 'foo'
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

