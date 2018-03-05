const Resource = require('./Resource.js');

class Resources {
    /**
     * Create a new instance of Resources.
     *
     * @param  {Array} items
     */
    constructor (items = []) {
        this.items = items;
    }

    /**
     * Load external api.
     *
     * @param  {Array} api
     * @return {Promise}
     */
    static load (api = []) {
        let items = new Resources();

        return new Promise((resolve, reject) => {
            items.items = api.map(item => new Resource(item));

            resolve(items);
        });
    }

    /**
     * Register a new api route.
     *
     * @param  {Resource} resource
     */
    register (resource) {
        if (! resource instanceof Resource) {
            return;
        }

        this.items.push(resource);
    }

    /**
     * Fetch data from Wrike with concurrent set of request.
     * Next request starts only after success ended the previous one.
     *
     * @param  {Object} token
     * @return {Promise}
     */
    fetchData (token) {
        return this.items.reduce((promise, resource) => {
            return promise.then(() => {
                return resource.fetchData(token);
            });
        }, Promise.resolve());
    }

    /**
     * Convert accumulate data to HTML.
     *
     * @param  {String} HTML
     * @return {String}
     */
    toHTML (HTML = '') {
        HTML += '<div class="head">';
        HTML += '<a href="Wrike_data.html" download>DOWNLOAD</a>';
        HTML += '</div>';

        HTML += '<h1>Wrike data</h1>';
        HTML += '<div style="margin 0 10% 0 10%">';

        this.items.forEach(resource => {
            HTML += resource.toHTML();
        });

        return HTML;
    }

    /**
     * Save all resource data to file system.
     */
    toFiles() {
        this.items.forEach(resource => {
            resource.toFile();
        });
    }

    /**
     * Save all resource data to Mongodb.
     */
    toMongoDB() {
        this.items.forEach(resource => {
            resource.toMongoDB();
        });
    }

    /**
     * Getter for resource by name.
     *
     * @param  {String} name
     * @return {Resource|Undefined}
     */
    get (name) {
        return this.items.filter(resource => resource.name === name)[0];
    }
}

module.exports = Resources;
