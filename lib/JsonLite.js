const LocalStorage = require('node-localstorage').LocalStorage;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const JsonLite = function (storagePath) {
    try {
        fs.statSync(path.resolve(storagePath));
    } catch (e) {
        mkdirp(path.resolve(storagePath));
    }

    localStorage = new LocalStorage(storagePath, Number.MAX_VALUE);
    return new Proxy({}, {
        get(target, name, receiver) {
            try {
                let it = localStorage.getItem(name);
                return JSON.parse(it);
            } catch (e) {
                console.log(e);
                return null;
            }

        },
        set(target, name, value, receiver) {
            let it = JSON.stringify(value,null,'\t');
            localStorage.setItem(name, it);
            return true;
        }
    });
};

module.exports = JsonLite;