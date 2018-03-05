const fs = require('fs');
const request = require('request');
var folders = require('../models/folders');
var accounts = require('../models/accounts');
var invitations = require('../models/invitations');
var tasks = require('../models/tasks');
var workflows = require('../models/workflows');
var contacts = require('../models/contacts');

class Resource
{
    /**
     * Create an instance of Resource.
     *
     * @param  {string} name
     * @param  {string} url
     */
    constructor ({ name, url }) {
        this.name = name;
        this.url = url;
        this.data = [];
    }

    /**
     * Fetch Data from Wrike.
     *
     * @param  {Object} token
     * @return {Promise}
     */
    fetchData (token, updateThisObject=false) {
        return new Promise((resolve, reject) => {
            request.get({
                url: this.url,
                headers: {
                    'Authorization': 'Bearer '+ token["access_token"]
                  }
            }, (error, response, body) => {
                if(!updateThisObject){
                    this.data = body;
                }                
                resolve(body)
            })
        });
    }

    /**
    * Overwrite Json to add Details
    *
    *@@return {Object}
    *
    */
    // updateData(token){
    //     return new Promise((resolve, reject) => {
    //         for(var _thisdata in this.data){
    //             if(_thisdata['authorId']){
    //                 this.url = this.url+'/contacts/'+_thisdata['authorId']
    //                 this.fetchData(token, true).then((contactDetails) => {
    //                     _thisdata['authorDetails'] = contactDetails
    //                     resolve(contactDetails)
    //                 })
    //             }
    //         }   
    //     });
    // }

    /**
     * Store resource data to file.
     *
     * @param  {String|null} filename
     * @param  {String} path
     * @return {Void}
     */
    toFile (filename = null, path = 'data/') {
        if (! filename) {
            filename = this.name + '.json';
        }

        if (path == '/') {
            path = '';
        }

        fs.writeFile(path + filename, this.data, (err) => {
            if (err) {
                console.error(err);
                return;
            };

            console.log('The file ' + filename + ' was saved!');
        });
    }


     /**
     * Store resource data to Mongodb.
     *
     * @return {Void}
     */
    toMongoDB () {        

        if(this.name=='folders'){
            var newfolder = new folders({
                user: null,
                foldersdata: JSON.parse(this.data),
            });
            newfolder.save(function(err) {
               console.log('folders Data saved')
            }); 
        } 

        if(this.name=='tasks'){
            var newtask = new tasks({
                user: null,
                taskdata: JSON.parse(this.data),
            });
            newtask.save(function(err) {
               console.log('Tasks Data saved')
            }); 
        } 

        if(this.name=='accounts'){
            var newaccount = new accounts({
                user: null,
                accountdata: JSON.parse(this.data),
            });
            newaccount.save(function(err) {
               console.log('Account Data saved')
            }); 
        } 

        if(this.name=='contacts'){
            var newcontact = new contacts({
                user: null,
                contactdata: JSON.parse(this.data),
            });
            newcontact.save(function(err) {
               console.log('contacts Data saved')
            }); 
        }              

        console.log('Data for ' + this.name + ' was saved in Mongodb!');       
    }

    /**
     * Sent resource data to HTML.
     *
     * @return {String}
     */
    toHTML () {
        return '<p> '+ this.data + '"<br><br><br>\n"; </p>';
    }
}

module.exports = Resource;
