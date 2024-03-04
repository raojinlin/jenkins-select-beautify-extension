const manifest = require('./manifest.development.json');
const fs = require('fs');
const path = require('path');

class Manifest {
    #manifest = manifest;

    constructor() {
    }

    setName(name) {
        if (!name) return this;
        this.#manifest.name = name;
        return this;
    }

    setDescription(description) {
        if (!description) return this;
        this.#manifest.description = description;
        return this;
    }

    setHostPermissions(...hostPermissions) {
        this.#manifest.host_permissions = hostPermissions;
        this.#manifest.content_scripts[0].matches = hostPermissions;
        return this;
    }

    toJSON() {
        return JSON.stringify(this.#manifest, null, 2);
    }

    toString() {
        return this.toJSON();
    }

    save() {
        fs.writeFileSync(path.resolve(__dirname) + "/manifest.json", this.toJSON());
    }
}

module.exports = new Manifest();
