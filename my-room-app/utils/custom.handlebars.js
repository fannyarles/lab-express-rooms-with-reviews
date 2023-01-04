const Handlebars = require('hbs');
const mongoose = require('mongoose');

Handlebars.registerHelper('isEqual', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(function (expression) {
        return args[0].equals(expression);
    });
});