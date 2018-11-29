/**
 *@module Util
*/
import fs from 'fs';
import path from 'path';

let toString = Object.prototype.toString;

export default {

    /**
     * tests if a variable is a string
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isString(variable) {
        return typeof variable === 'string';
    },

    /**
     * tests if a variable is a number
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isNumber(variable) {
        return typeof variable === 'number' && !isNaN(variable) && isFinite(variable);
    },

    /**
     * tests if a variable is a function
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isCallable(variable) {
        return (toString.call(variable) === '[object Function]' || variable instanceof Function) && !(variable instanceof RegExp);
    },

    /**
     * tests if a variable is an array
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isArray(variable) {
        return toString.call(variable) === '[object Array]' || variable instanceof Array;
    },

    /**
     * tests if a variable is an object
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isObject(variable) {
        return typeof variable === 'object' && variable !== null;
    },

    /**
     * tests if a variable is a plain object literal
     *@param {*} variable - variable to test
     *@returns {boolean}
    */
    isPlainObject(variable) {
        if (this.isObject(variable)) {
            let prototypeOf = Object.getPrototypeOf(variable);
            return prototypeOf === null || prototypeOf === Object.getPrototypeOf({});
        }
        return false;
    },

    /**
     * tests if a variable is a valid function parameter
     *@param {*} variable - variable to test
     *@param {boolean} excludeNulls - boolean value indicating if null values should be
     * taken as an invalid parameter
     *@returns {boolean}
    */
    isValidParameter(variable, excludeNulls) {
        if (excludeNulls && variable === null)
            return false;
        return typeof variable !== 'undefined';
    },

    /**
     * returns the argument if it is already an array, or makes an array using the argument
     *@param {*} arg - the argument
     *@param {boolean} excludeNulls - boolean value indicating if null argument should default
     * to empty array just like undefined argument
     *@returns {Array}
    */
    makeArray(arg, excludeNulls) {
        if (this.isArray(arg))
            return arg;
        return this.isValidParameter(arg, excludeNulls)? [arg] : [];
    },

    /**
     * returns the arg if it is a plain object, otherwise, returns empty object
     *@param {mixed} arg - the argument
     *@returns {Object}
    */
    makeObject(arg) {
        return this.isPlainObject(arg)? arg : {};
    },

    /**
     * generates a callback function, scoping the execution with optional extra parameters
     *@param {Function} callback - the callback function
     *@param {Scope} [scope] - the execution scope - defaults to the host object
     *@param {Array} [parameters=null] - array of parameters to pass in to callback during execution
     *@throws {TypeError} throws error if callback is not a function
     *@returns {Function}
    */
    generateCallback(callback, scope, parameters) {
        if (!this.isCallable(callback)) {
            throw new TypeError('argument one is not a function');
        }
        scope = this.isObject(scope) ? scope : null;
        parameters = this.makeArray(parameters);

        return (...args) => {
            let mergedParameters = [...args, ...parameters];
            try {
                return callback.apply(scope, mergedParameters);
            }
            catch (ex) {
                //
            }
        };
    },

    /**
     * runs the executable and supresses all runtime errors
     *@param {Function} executable - function to execute
     *@param {Scope} [scope] - runtime scope object - defaults to the host object
     *@param {Array} [parameters=null] - array of parameters to pass in to executable
     *@param {number} [runAfter=0] - least number of time in milliseconds to wait before
     * starting the execution
     *@throws {TypeError} if argument one is not a function
     *@returns {mixed} this will return a promise if runAfter parameter is given else it will
     * return the execution control
    */
    runSafe(executable, scope, parameters, runAfter) {
        let callback = this.generateCallback(executable, scope, parameters);
        if (runAfter) {
            return new Promise(function(resolve) {
                setTimeout(() => {
                    resolve(callback()); // pass in the return value to the resolve method
                }, runAfter);
            });
        }
        return callback();
    },

    /**
     * converts the letters into camel like cases
     *@param {string} value - the string word to convert
     *@param {string|RegExp} [delimiter=/[-_]/] - a delimiter string or regex pattern used in
     * finding split segments
     *@returns {string}
    */
    camelCase(value, delimiter = /[-_]/) {
        value = value.toString();
        let tokens = value.split(delimiter).map((token, idx) => {
            return idx === 0? token : token[0].toUpperCase() + token.substring(1);
        });
        return tokens.join('');
    },

    /**
     * generates a radom text with given length of characters
     *@param {number} [length=4] - char length of the random text to generate
     *@returns {string}
    */
    getRandomText(length) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            rands = [], i = -1;

        length = length? length : 4;
        while (++i < length)
            rands.push(chars.charAt(Math.floor(Math.random() * chars.length)));

        return rands.join('');
    },

    /**
     * creates a directory recursively and synchronously
     *@param {string} dir - the directory to create
     *@returns {boolean}
    */
    mkDirSync(dir) {
        if (typeof dir !== 'string')
            throw new TypeError('argument one is not a string');

        if (fs.existsSync(dir))
            return true;

        //search backwards and get the last path that already exists
        dir = dir.replace(/\/+$/, '');
        let existingPath = '',
            testPath = dir;
        while (existingPath === '' && testPath !== '/') {
            testPath = path.join(testPath, '../');

            if (fs.existsSync(testPath))
                existingPath = testPath;
        }

        dir.split(existingPath)[1].split('/').forEach(pathToken => {
            existingPath = path.join(existingPath, '/', pathToken);
            fs.mkdirSync(existingPath);
        });

        return true;
    },

    /**
     * assigns the objects to the target object. this better than object.assign as it performs
     * deep copy
     *@param {Object} target - the target object
     *@param {...Objects} objects - comma separated list of objects
     *@returns {Object}
    */
    assign(target, ...objects) {

        const copyObject = function(dest, object) {
            dest = this.isObject(dest)? dest : {};
            for (let [key, value] of Object.entries(object)) {
                dest[key] = cordinate.call(this, dest[key], value);
            }

            return dest;
        };

        const copyArray = function(dest, values) {
            dest = this.isArray(dest)? dest : [];

            values.forEach((current, index) => {
                dest[index] = cordinate.call(this, null, current);
            });

            return dest;
        };

        //cordinates the calls
        const cordinate = function(dest, value) {
            if (this.isArray(value)) {
                return copyArray.call(this, dest, value);
            }
            else if (this.isObject(value)) {
                return copyObject.call(this, dest, value);
            }
            else {
                return value;
            }
        };

        target = this.isPlainObject(target)? target : {};

        for (const object of objects) {

            if (!this.isObject(object))
                continue;

            for (const [key, value] of Object.entries(object)) {
                target[key] = cordinate.call(this, target[key], value);
            }
        }
        return target;
    },

    /**
     * returns the value for the first key in the keys array that exists in the object
     * otherwise, return the default value
     *
     *@param {string[]|string} keys - array of keys or a single string key
     *@param {Object} object - the object
     *@param {mixed} [defaultValue=undefined] - the default value to return if otherwise.
     * defaults to undefined
     *@return mixed
    */
    value(keys, object, defaultValue) {
        keys = this.makeArray(keys);

        if (this.isPlainObject(object)) {
            for (let key of keys) {
                if (this.isString(key) && typeof object[key] !== 'undefined')
                    return object[key];
            }
        }
        return defaultValue;
    },

    /**
     * defines a getter property on the target object if it is not yet defined
     *@param {Object} target - the target object
     *@param {string} name - property name
     *@param {Function} getter - the getter function
     *@return {this}
    */
    defineGetter(target, name, getter) {
        if (typeof target[name] === 'undefined')
            Object.defineProperty(target, name, {get: getter});

        return this;
    }
};