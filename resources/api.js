const ACCOUNT_ID = "IEABRGBF";
const baseUrl = 'https://www.wrike.com/api/v3';
///accounts/' + ACCOUNT_ID +  '
const api = [
    {
        name: 'tasks',
        url: baseUrl + '/tasks?fields=["sharedIds","dependencyIds","briefDescription","parentIds","superParentIds","subTaskIds","responsibleIds","description","recurrent","authorIds","attachmentCount","hasAttachments","customFields","superTaskIds","metadata"]'
    },{
        name: 'folders',
        url: baseUrl + '/folders'
    },{
        name: 'workflows',
        url: baseUrl + '/workflows'
    },{
        name: 'contacts',
        url: baseUrl + '/contacts'
    },{
        name: 'groups',
        url: baseUrl + '/groups'
    },{
        name: 'invitations',
        url: baseUrl + '/invitations'
    },{
        name: 'accounts',
        url: baseUrl + '/accounts/'
    },{
        name: 'customfields',
        url: baseUrl + '/customfields'
    },{
        name: 'comments',
        url: baseUrl + '/comments'
    },{
        name: 'timelogs',
        url: baseUrl + '/timelogs'
    },{
        name: 'attachments',
        url: baseUrl + '/attachments'
    }
];

module.exports = api;
