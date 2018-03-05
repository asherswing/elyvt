var request = require('request');
const util = require('util');
var folders = require('../models/folders');
var taskModel = require('../models/tasks');
var userModel = require('../models/user');
var rolesModel = require('../models/roles');
var logs = require('../models/logs');
var async = require('async');

module.exports = {


	foldersHeierarcy: function($foldersData, $folderId=null){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = "";
			folders.getrootfolder(function(err, rootfolder){
				if(rootfolder == null){
					folderData = {
						title: 'Root',
						parentId: [],
						scope: "WsRoot",
						isProject: false
					}
					var newfolder = new folders(folderData);
					newfolder.save(function(err, rootfolder) {
				       $rootFolderId = rootfolder._id;
						//console.log("Line 15: --", rootfolder);
						module.exports.getfolderbyParentId($rootFolderId).then(foldersListHtmlData => {
							foldersListHtml += '<ul class="nav child_menu">';
							foldersListHtml += foldersListHtmlData;
							foldersListHtml += '</ul>'
							//console.log(foldersListHtmlData);
							resolve(foldersListHtml)
						});
				    });	
				}else{
					$rootFolderId = rootfolder._id;
					//console.log("Line 15: --", rootfolder);
					module.exports.getfolderbyParentId($rootFolderId).then(foldersListHtmlData => {
						foldersListHtml += '<ul class="nav child_menu">';
						foldersListHtml += foldersListHtmlData;
						//foldersListHtml += '<li class ="active"><a href="/archive"><i class="fa fa-trash "></i> Archive</a></li>';
						foldersListHtml += '</ul>'
						//console.log(foldersListHtmlData);
						resolve(foldersListHtml)
					});
				}
			});
			
		})
	},


	getfolderbyParentId: async function($rootFolderId, $i=0){
		return new Promise(function (resolve, reject) {
			var foldersListHtml = '';
			var childTree = [];
			var isActiveFolder = false;
			folders.getfolderbyParentId($rootFolderId, function(err, wsfolder){
				if((typeof wsfolder == 'object') && (wsfolder.length>0)){
					async.forEachSeries(wsfolder, function(value, callback){						
						$i++;
						if(value.isDeleted != true){
						//if(value.isDeleted != 'undefined'){	
						   //if(value.isDeleted == false){						
							module.exports.getfolderbyParentId(value._id, 0).then(foldersListHtmlData => {
								foldersListHtml += "<li class=\"sub_menu list-"+value._id+"\" id ="+value._id+">";
								if(foldersListHtmlData != ''){
									foldersListHtml += "<a><span class=\"fa fa-plus toggle-folder\"></span>";								
								}else{
									foldersListHtml += "<a href=\"/folders/?id="+value._id+"\"><span class=\"fa fa-circle\"></span>";							
								}
								foldersListHtml += "<span onclick='window.location.href=\"/folders/?id="+value._id+"\"'>"+value.title;
								foldersListHtml += "</span></a>";
								if(foldersListHtmlData != ''){
									foldersListHtml += '<ul class="folderDetails nav child_menu ul-'+value._id+' ">' 
									foldersListHtml += foldersListHtmlData;
									foldersListHtml += "</ul>";
								}
								foldersListHtml += "</li>";
								//console.log($i, wsfolder.length,  $i == wsfolder.length);
								 if($i == wsfolder.length){
								 	resolve(foldersListHtml);	
								 }
									//resolve(foldersListHtml);								
									callback();
								});
							}else{
									if($i == wsfolder.length){
									 	resolve(foldersListHtml);	
									 }
									callback();
								}
							});
						//}
						// else{
						// 	console.log("Line 88");
						// 	if($i == wsfolder.length){
						// 		 	resolve(foldersListHtml);	
						// 		 }
						// 	callback();	
						// }}else{
						// 	console.log("Line 91");
						// 	if($i == wsfolder.length){
						// 		 	resolve(foldersListHtml);	
						// 		 }
						// 	callback();	
						// }	
					}
				else{
					resolve(foldersListHtml)
				}
								
			});
		});
	},

	foldersDetails: function(moment, $tasksData, $foldersData, $contactsData, $folderId){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = "";
			foldersTasksListHtml = "";
			//$foldersData = JSON.parse($foldersData)
			folders.getfolderbyId($folderId, function(err, wsfolder){
				//console.log("============Line No 126=======",wsfolder)
				folders.getfolderbyId(wsfolder.milestone, function(err, milestoneData){
					//console.log("===========Line No 127======",wsfolder.project,wsfolder.milestone,$folderId);
					folders.getfolderbyId(wsfolder._id, function(err, projectData){

				$childrens = []
				foldersListHtml = '<div class="x_panel">\
				<div class="x_title">'
				foldersListHtml += "<h2>"+wsfolder.title+"</h2>"
				foldersListHtml += '<div class="clearfix"></div>\
				</div>'
				foldersListHtml += '<div class="x_content">'
				foldersListHtml += '<ul class="folderDetails child_menu">'
				

				folders.getfolderbyParentId(wsfolder._id, function(err, wsChildfolder){
					//console.log("-========================Line 134---",wsChildfolder);
					if((wsChildfolder.length>0)){
						async.forEachSeries(wsChildfolder, function(wsdatavalue, callback){
						foldersListHtml += "<li><a><i class='fa fa-folder' onclick=\"window.location.href='/folders/?id="+wsdatavalue._id+"' \"></i>"+wsdatavalue.title+"</a>" 
			           // foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1)
			            foldersListHtml += '</li>'
			            $childrens.push(wsChildfolder) 
			            callback()
		            	});
				}
				foldersListHtml += '</ul>'	

				foldersTasksListHtml += '<table class="table table-striped projects" id ="data-table">\
						<thead>\
						<tr>\
						<th style="width: 1%">#</th>\
						<th >Task</th>\
						<th >Discription</th>\
						<th >Visible Task Name</th>\
						<th >Project Name</th>\
						<th >Start Date</th>\
						<th >End Date</th>\
						<th >Attechment</th>\
						<th >Dependencies</th>\
						<th>Status</th>\
						<th>Assignee</th>\
						</tr>\
						</thead>\
						<tbody>';

				module.exports.getfolderTasks(moment, $tasksData, $contactsData, wsfolder._id).then(foldersListHtmlArr=>{
					foldersTasksListHtml += foldersListHtmlArr['tasks']
		    		foldersTasksListHtml += "</tbody>\
				      						</table>"
	    			  foldersListHtml += '</div>\
				      </div>'					
					  //console.log("-------narendra yadav------------------------", foldersTasksListHtml);		    		
				      wsfolder.childrens = $childrens
				      foldersList.push(wsfolder);
				      returnResponse = {
				      	    'wsfolder' : wsfolder,
							'foldersListHtml': foldersListHtml,
							'milestoneData': milestoneData,
							'projectData': projectData,
							'foldersTasksListHtml': foldersTasksListHtml		
						}
						resolve(returnResponse)	
				})
			
	    		 });
                  });
	    		  });	      
			  });
			
		})
	},


	getsubfolder :function(foldersElement,$foldersData, level=1, $folderId=null){
		foldersHTML = '';
		foldersListHtml = '<ul class="folderDetails nav child_menu">'       

		for(var subfolder in $foldersData[foldersElement]['childIds']){
			$childrens = []
			for(var foldersElement2 in $foldersData){ 
				if($foldersData[foldersElement2]['_id']==$foldersData[foldersElement]['childIds'][subfolder]){

					foldersListHtml += "<li";
					if($folderId==$foldersData[foldersElement2]['_id']){
						foldersListHtml += " class='active'"
					}
					foldersListHtml += ">"
					if ($foldersData[foldersElement2]['childIds'].length > 0) {
						foldersListHtml += "<a ><span class=\"fa fa-plus toggle-folder\"></span>" 
					}else{
						
						foldersListHtml += "<a href=\"/folders/?id="+$foldersData[foldersElement2]['_id']+"\" class=\"activate-"+$foldersData[foldersElement2]['_id']+"\"><span class=\"fa fa-circle\"></span>"
					}

					foldersListHtml += "<span onclick='window.location.href=\"/folders/?id="+$foldersData[foldersElement2]['_id']+"\"'>"+$foldersData[foldersElement2]['title']+"</span></a>" 
			//$foldersData[foldersElement2]['childrens'] = module.exports.getsubfolder(foldersElement2,$foldersData, 1)		            
			foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1, $folderId)	
			foldersListHtml += '</li>'
			$childrens.push($foldersData[foldersElement2]) 
			
		}
	}
}
foldersListHtml += '</ul>'
return foldersListHtml

},


getfolderdata: function (moment, $foldersData, $contactsData){
return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Assignee</th>\
		<th>Status</th>\
		</tr>'
		for(var folderElement in $foldersData){
			if( ($foldersData[folderElement]['project']) && ($foldersData[folderElement]['scope']=='WsFolder')){
				var startDate = '-'
				var endDate = '-'
				if($foldersData[folderElement]['projectManager']){
					var contact = module.exports.getContactByID($foldersData[folderElement]['projectManager'])
					var contactName = '-'
					if (contact != null){
						contactName = contact['firstname']+' '+contact['lastname'];
					}
					$foldersData[folderElement]['projectManager'] = contact;
				}
				foldersArr.push($foldersData[folderElement]);
				if($foldersData[folderElement]['project']['startDate']){
					var startDateObj = moment($foldersData[folderElement]['project']['startDate'],'MM/DD/YY');
					startDate = startDateObj.format('MM/DD/YY');
				}
				if($foldersData[folderElement]['project']['endDate']){
					var endDateObj = moment($foldersData[folderElement]['project']['endDate'],'MM/DD/YY');
					endDate = endDateObj.format('MM/DD/YY')
				}
				var contact = module.exports.getContactByID($foldersData[folderElement]['project']['authorId'])
				var contactName = '-'
				if (contact != null){
					contactName = contact['firstname']+' '+contact['lastname'];
				}
				foldersTableHTML += "<tr>\
				<td><a href='/folders/?id="+$foldersData[folderElement]['_id']+"'>"+$foldersData[folderElement]['title']+"</a></td>\
				<td>"+startDate+"</td>\
				<td>"+endDate+"</td>\
				<td>"+contactName+"</td>\
				<td>"+$foldersData[folderElement]['project']['status']+"</td>\
				<td><a href='/edit/folderdata/?id="+$foldersData[folderElement]['_id']+"' class='btn btn-primary btn-sm'><i class='fa fa-edit'></i></a></td>\
				</tr>"
			}
		}
		foldersTableHTML += '</table>'
		returnResponse = {
			'foldersArr': foldersArr,
			'foldersTableHTML': foldersTableHTML
		}
		resolve(returnResponse)
	});
},

getcontacts: function ($userdata){
return new Promise(function (resolve, reject) {
	

		var contactsHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Name</th>\
		<th>Email</th>\
		<th>Phone No.</th>\
		<th></th>\
		<th></th>\
		</tr>'
		$userincrement= 0;
		async.forEachSeries($userdata, function(uservalue, callback){
			var rolestitle =''
			var rolesID = uservalue['roles'][0];
			rolesModel.getrolesbyId(rolesID, function(roleErr, rolesDetails){
				$userincrement++;
				//console.log("=====Line No 292",rolesDetails)
				if(rolesDetails != null){
					rolestitle = rolesDetails['title']
				}
				else{
					rolestitle = '-';
				}
		contactsHTML += "<tr>\
				<td>"+rolestitle+"</td>\
				<td>"+uservalue['firstname']+"</td>\
				<td>"+uservalue['email']+"</td>\
				<td>"+uservalue['phone']+"</td>\
				<td><a href='/contact/edit?id="+uservalue['_id']+"' class='btn btn-primary btn-sm'><i class='fa fa-edit'></i></a></td>\
				<td><a href='/contact/delete?id="+uservalue['_id']+"' class='btn btn-danger glyphicon glyphicon-trash'></a></td>\
				</tr>"
				
//console.log("========line line 304",$userincrement,$userdata.length)
				if($userincrement == $userdata.length){
					contactsHTML  += '</table>'
					resolve(contactsHTML);
					callback();
				}else{
					callback();
				}
					
			
			});
		});

		
		

});
},
getemailcontacts: function ($userdata){
return new Promise(function (resolve, reject) {
	
       var contactsHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th></th>\
		<th>Title</th>\
		<th>Name</th>\
		<th>Email</th>\
		</tr>'
		$userincrement= 0;
		async.forEachSeries($userdata, function(uservalue, callback){
			var rolesID = uservalue['roles'][0];
			rolesModel.getrolesbyId(rolesID, function(roleErr, rolesDetails){
				$userincrement++;
				
		contactsHTML += "<tr>\
                <td><input type=\"checkbox\"  name=\"email_setting\"  id =\"emailsetting\" onChange=\"changeemail_setting('"+uservalue['_id']+"',this.value)\" "
                if(uservalue['email_setting'] == 'on'){
                	contactsHTML += "checked='true'";	
                }
        contactsHTML += "></td>\
				<td>"+rolesDetails['title']+"</td>\
				<td>"+uservalue['firstname']+"</td>\
				<td>"+uservalue['email']+"</td>\
				</tr>"
				
              if($userincrement == $userdata.length){
					contactsHTML  += '</table>'
					resolve(contactsHTML);
					callback();
				}else{
					callback();
				}
					
			
			});
		});

		
		

});
},
getroles: function ($rolesdata){
return new Promise(function (resolve, reject) {
	

		var contactsHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th></th>\
		<th></th>\
		</tr>'
		for (var rolesdata in $rolesdata){
		contactsHTML += "<tr>\
				<td>"+$rolesdata[rolesdata]['title']+"</td>\
				<td><a href='/role/edit?id="+$rolesdata[rolesdata]['_id']+"' class='btn btn-primary btn-sm fa-pancil'><i class='fa fa-edit'></i></a></td>\
				<td><a href='/role/delete?id="+$rolesdata[rolesdata]['_id']+"' class='btn btn-danger glyphicon glyphicon-trash'></a></td>\
				</tr>"
			}
		contactsHTML  += '</table>'
		
		resolve(contactsHTML)
});

},

getTaskByFolder: function(moment, $contactsData, projectId){
	return new Promise(function(resolve, reject){
		taskArr = [];
		//console.log('projectId:', projectId);
		if(projectId != null){
			//console.log('projectId not null :', projectId);
			taskModel.getTasksByProject(projectId, function(taskserr, tasksContents){
				//console.log("tasksContents", tasksContents);
				resolve(tasksContents);
			})
		}else{
			var tasksData = [];
			$i =0;
			taskModel.getalltasks(function(taskserr, tasksContents){
				//console.log("=========Narendra",tasksContents)
				if(tasksContents.length>0){
					for(var item in tasksContents){
						$i++;
						
							tasksData.push(tasksContents[item]);
						}
						if($i == tasksContents.length){
							resolve(tasksData);	
						}
					
				}else{
					resolve(tasksData);	
				}
				
			})
		}
	});
},
getLogsData: function($logsData){
return new Promise(function (resolve, reject) {
		
		var LogsTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Property</th>\
		<th>Date</th>\
		<th>User</th>\
		<th>Object</th>\
		<th>Action</th>\
		<th>Before</th>\
		<th>After</th>\
		<th></th>\
		</tr>';
		for(var getlogs in $logsData){
		LogsTableHTML += "<tr>\
				<td>"+$logsData[getlogs]['log']+" ("+$logsData[getlogs]['log_type']+")</td>\
				<td>"+$logsData[getlogs]['created_at']+"</td>\
				<td>"+$logsData[getlogs]['user_id']['firstname']+"</td>\
				<td>"+$logsData[getlogs]['log_type']+"</td>\
				<td>"+$logsData[getlogs]['action']+"</td>";
				if($logsData[getlogs]['old_data']){
					if($logsData[getlogs]['log_type']=="Milestone" || $logsData[getlogs]['log_type']=="Project"){
						LogsTableHTML += "<td>";
						LogsTableHTML +="Title: "+JSON.stringify($logsData[getlogs]['old_data']['title'])
						LogsTableHTML +="<br/>Description: "+JSON.stringify($logsData[getlogs]['old_data']['description'])
						LogsTableHTML +="<br/>Start Date: "+JSON.stringify($logsData[getlogs]['old_data']['startDate'])
						LogsTableHTML +="<br/>End Date: "+JSON.stringify($logsData[getlogs]['old_data']['endDate'])
						LogsTableHTML +="<br/>Dependencies: "+JSON.stringify($logsData[getlogs]['old_data']['dependencyIds'])
						LogsTableHTML +="<br/>Status: "+JSON.stringify($logsData[getlogs]['old_data']['status'])
						LogsTableHTML +="</td>";
					}else{
						LogsTableHTML += "<td>"+JSON.stringify($logsData[getlogs]['old_data'])+"</td>";
					}
					if($logsData[getlogs]['log_type']=="Milestone" || $logsData[getlogs]['log_type']=="Project"){
						LogsTableHTML += "<td>";
						LogsTableHTML +="Title: "+JSON.stringify($logsData[getlogs]['old_data']['title'])
						LogsTableHTML +="<br/>Description: "+JSON.stringify($logsData[getlogs]['old_data']['description'])
						LogsTableHTML +="<br/>Start Date: "+JSON.stringify($logsData[getlogs]['old_data']['startDate'])
						LogsTableHTML +="<br/>End Date: "+JSON.stringify($logsData[getlogs]['old_data']['endDate'])
						LogsTableHTML +="<br/>Dependencies: "+JSON.stringify($logsData[getlogs]['old_data']['dependencyIds'])
						LogsTableHTML +="<br/>Status: "+JSON.stringify($logsData[getlogs]['old_data']['status'])
						LogsTableHTML +="</td>";
					}else{
						LogsTableHTML += "<td>"+JSON.stringify($logsData[getlogs]['old_data'])+"</td>";
					}
				}
				else{
					LogsTableHTML += "<td></td>";
					LogsTableHTML += "<td></td>";
				}
				LogsTableHTML += "<td></td>\
				</tr>"
			}
		LogsTableHTML  += '</table>'
		
		resolve(LogsTableHTML)
});
},
getProjects: function(moment, $foldersData, $contactsData){
	return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Project Manager</th>\
		<th>Status</th>\
		<th></th>\
		<th></th>\
		</tr>';

		folders.getprojects(function(err, ProjectsData){
			console.log("========Line No 470=========",ProjectsData)
			if(ProjectsData != 'undefined'){
			    	if((ProjectsData != null) && (ProjectsData.length>0)){
			    		$projectIncrement=0;
				    	async.forEachSeries(ProjectsData, function(value, callback){
				    		module.exports.getProjectStatus(value._id).then((projectStatus)=>{

				    			$projectIncrement++;
					    		$parentFolderId = value._id;
					    		$projectName = value.title;
					    		$authorIds = value.user;
					    		//console.log("Line 382", $projectName);

					    		var startDate = '-'
								var endDate = '-'
								var ProjectDateStatus = 'Active';

								foldersArr.push(value);
								if(value['project']['startDate']){
									var startDateObj = moment(value['project']['startDate'],'MM/DD/YY');
									startDate = startDateObj.format('MM/DD/YY');	
									if(moment()<=startDateObj){
										ProjectDateStatus = 'Upcoming'
									}								
								}
								if(value['project']['endDate']){
									var endDateObj = moment(value['project']['endDate'],'MM/DD/YY');
									endDate = endDateObj.format('MM/DD/YY');
									if(moment()<=endDateObj){
										ProjectDateStatus = 'Completed'
										if(projectStatus=="Active"){
											ProjectDateStatus = 'Active'
										}
									}else{
										if(projectStatus=="Active"){
											ProjectDateStatus = 'Delayed'
										}else{
											ProjectDateStatus = 'Completed'
										}
										
									}
								}

								
								foldersTableHTML += "<tr>\
								<td>";
								if((projectStatus=="Active") && (ProjectDateStatus=="Active")){
									foldersTableHTML += '<i class="fa fa-circle" style="color:green"></i> ';
								}else if((projectStatus=="Completed") && (ProjectDateStatus=="Completed")){
									foldersTableHTML += '<i class="fa fa-circle" style="color:grey"></i> ';
								}else{
									foldersTableHTML += '<i class="fa fa-circle" style="color:yellow"></i> ';
								}
								foldersTableHTML += "<a href='/?id="+value['_id']+"'>"+value['title']+"</a>\
								</td>\
								<td>"+startDate+"</td>\
								<td>"+endDate+"</td>\
								<td>"+value['projectManager']['firstname']+" "+value['projectManager']['lastname']+"</td>\
								<td>"+ProjectDateStatus+"</td>\
								<td>\
								<a href='/view_documents/?id="+value['_id']+"' class='btn btn-primary btn-sm'><i class='fa fa-eye'></i>View Document</a>\
								<a href='/projects/edit/project?id="+value['_id']+"' class='btn btn-primary btn-sm fa-pancil'><i class='fa fa-edit'></i></a></td>\
								<td><a href='/projects/project/delete?id="+value['_id']+"' class='btn btn-danger glyphicon glyphicon-trash'></a></td>\
								</tr>"

								if($projectIncrement == ProjectsData.length){
									foldersTableHTML += '</table>'
									returnResponse = {
										'foldersArr': foldersArr,
										'foldersTableHTML': foldersTableHTML
									}
									resolve(returnResponse)
									callback()
								}else{
									callback()
								}

				    		});
				    	});
				    }else{
				    	returnResponse = {
							'foldersArr': foldersArr,
							'foldersTableHTML': foldersTableHTML
						}
						resolve(returnResponse)
				    }
			    }

		});
		
	});
},


getArchiveProjects: function(moment, $foldersData, $contactsData){
	return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Project Manager</th>\
		<th>Status</th>\
		<th></th>\
		<th></th>\
		</tr>';

		folders.getArchiveProjects(function(err, ProjectsData){
			if(ProjectsData != 'undefined'){
			    	if((ProjectsData != null) && (ProjectsData.length>0)){
			    		$projectIncrement=0;
				    	async.forEachSeries(ProjectsData, function(value, callback){
				    		module.exports.getProjectStatus(value._id).then((projectStatus)=>{

				    			$projectIncrement++;
					    		$parentFolderId = value._id;
					    		$projectName = value.title;
					    		$authorIds = value.user;
					    		//console.log("Line 382", $projectName);

					    		var startDate = '-'
								var endDate = '-'
								var ProjectDateStatus = 'Active';

								foldersArr.push(value);
								if(value['project']['startDate']){
									var startDateObj = moment(value['project']['startDate'],'MM/DD/YY');
									startDate = startDateObj.format('MM/DD/YY');	
									if(moment()<=startDateObj){
										ProjectDateStatus = 'Upcoming'
									}								
								}
								if(value['project']['endDate']){
									var endDateObj = moment(value['project']['endDate'],'MM/DD/YY');
									endDate = endDateObj.format('MM/DD/YY');
									if(moment()<=endDateObj){
										ProjectDateStatus = 'Completed'
										if(projectStatus=="Active"){
											ProjectDateStatus = 'Active'
										}
									}else{
										if(projectStatus=="Active"){
											ProjectDateStatus = 'Delayed'
										}else{
											ProjectDateStatus = 'Completed'
										}
										
									}
								}

								
								foldersTableHTML += "<tr>\
								<td>";
								if((projectStatus=="Active") && (ProjectDateStatus=="Active")){
									foldersTableHTML += '<i class="fa fa-circle" style="color:green"></i> ';
								}else if((projectStatus=="Completed") && (ProjectDateStatus=="Completed")){
									foldersTableHTML += '<i class="fa fa-circle" style="color:grey"></i> ';
								}else{
									foldersTableHTML += '<i class="fa fa-circle" style="color:yellow"></i> ';
								}
								foldersTableHTML += "<a href='/?id="+value['_id']+"'>"+value['title']+"</a>\
								</td>\
								<td>"+startDate+"</td>\
								<td>"+endDate+"</td>\
								<td>"+value['projectManager']['firstname']+" "+value['projectManager']['lastname']+"</td>\
								<td>"+ProjectDateStatus+"</td>\
								<td><a href='/projects/edit/project?id="+value['_id']+"' class='btn btn-primary btn-sm'><i class='fa fa-edit'></i></a></td>\
								<td><a href='/projects/project/restore?id="+value['_id']+"' class='btn btn-success'>Restore</a></td>\
								</tr>"

								if($projectIncrement == ProjectsData.length){
									foldersTableHTML += '</table>'
									returnResponse = {
										'foldersArr': foldersArr,
										'foldersTableHTML': foldersTableHTML
									}
									resolve(returnResponse)
									callback()
								}else{
									callback()
								}

				    		});
				    	});
				    }else{
				    	returnResponse = {
							'foldersArr': foldersArr,
							'foldersTableHTML': foldersTableHTML
						}
						resolve(returnResponse)
				    }
			    }

		});
		
	});
},



getfolderTasks :function(moment, $tasksData, $contactsData,  $folderId, tasksArr=[], ganttTasks=[], $taskincrement=0, $taskHtml=''){
	return new Promise(function (resolve, reject) {
		tasks = $taskHtml;
		//console.log("-=-=-=-=-=-=", $folderId);
      //      
      //foldersModel.getfolderbyId(projectId, function(err, projectData){
                 taskModel.gettaskbyParentId($folderId, function(err, data){
	    				if(data.length>0){
		    					async.forEachSeries(data, function(wsdatavalue, callback){
		    						//console.log("...........................", "Task_found", wsdatavalue['title']);
		    						$taskincrement++
			    					console.log('Task Found', wsdatavalue, data.length);
				    				tasksArr.push(wsdatavalue);
				    				if(wsdatavalue['dates']){				    					
					    				if(wsdatavalue['dates']['start']){
					    					//console.log('Task Found', wsdatavalue.title, data.length, $i);
					    					ganttTasks.push(wsdatavalue);
					    				}
					    			}
					    			tasks += '<tr><td>#</td>'; 
				    				tasks += '<td><a href="/tasks/task/?id='+wsdatavalue['_id']+'">'+wsdatavalue['title']+'</a><br />';
				    				if(data['createdDate']){
				    				var d = moment(data['createdDate'],'MM/DD/YY');
					    				tasks += '<small>Created '+d.format('DD MMM,  YYYY')+'</small'
					    			}
					    			tasks += '</td>'
                                   
				    				tasks += '<td>'+wsdatavalue['description']+'</td>'
				    				 if(wsdatavalue['visible_task_name'] != undefined){
				    			    tasks += '<td>'+wsdatavalue['visible_task_name']+'</td>'
                                        }
                                        else{
                                        	tasks += '<td>-</td>'
                                        }
				    			    tasks += '<td>'+wsdatavalue['project']['title']+'</td>'
				    				if(typeof wsdatavalue['dates'] != "undefined"){
				    					tasks += '<td>'+wsdatavalue['dates']['start']+'</td>'
				    					tasks += '<td>'+wsdatavalue['dates']['due']+'</td>'
				    				}else{
				    					tasks += '<td>-</td>'
				    					tasks += '<td>-</td>'
				    				}
				    				if(wsdatavalue['attachmentCount'] != undefined){
				    					tasks += '<td>'+wsdatavalue['attachmentCount']+'</td>'
				    				}
				    				else{
				    					tasks += '<td>-</td>'
				    				}
				    				if(wsdatavalue['dependencyIds'] != undefined && wsdatavalue['dependencyIds'] != null){
				    					tasks += '<td>'+wsdatavalue['dependencyIds']+'</td>'
				    				}
				    				else{
				    					tasks += '<td>-</td>'
				    				}

				    				if (data['status']=='Completed'){
				    					tasks += '<td><button class="btn btn-success btn-xs">'+wsdatavalue['status']+'</button></td>'
				    				}else{
				    					tasks += '<td>'+wsdatavalue['status']+'</td>'
				    				}
                                    tasks += '<td>'+wsdatavalue['authorIds'][0]['firstname']+' '+wsdatavalue['authorIds'][0]['lastname']+'</td>'
				    				
				    				
				    				
				    				tasks += '</tr>';
				    				if(data.length == $taskincrement){
				    					returnResponse = {
								    		'tasks': tasks,
								    		'tasksArr': tasksArr,
								    		'ganttTasks': ganttTasks
								    	}
								    	resolve(returnResponse)
				    				}
				    				callback();
								});		    				
			    			}else{
			    				//console.log($folderId);

			    				folders.getfolderbyParentId($folderId, function(err, wsfolder){
				    				//console.log("..==.", $folderId, wsfolder.length);				    				
				    					if(wsfolder.length > 0){
				    						var $j = 0;
					    					async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
						    					//console.log("......", wsfoldervalue._id, wsfoldervalue.title, $j);	
						    						$j++;							
							    					module.exports.getfolderTasks(moment, $tasksData, $contactsData, wsfoldervalue._id, tasksArr, ganttTasks, 0, tasks).then(foldertaskData=>{
							    						//console.log(foldertaskData['tasks']);
							    						if(foldertaskData['tasksArr']>0){
							    							tasks +=  foldertaskData['tasks'];
							    							tasksArr.concat(foldertaskData['tasksArr']);
							    						}							    						
							    						if(wsfolder.length <= $j){
							    							//console.log("..............",wsfolder.length, $j, tasksArr )
							    							returnResponse = {
													    		'tasks': tasks,
													    		'tasksArr': tasksArr,
													    		'ganttTasks': ganttTasks
													    	}
													    	resolve(returnResponse)
							    						}
							    						callback2();
							    					});						    						
						    				});
					    				}else{
					    					//console.log("..............----");

						    					returnResponse = {
										    		'tasks': tasks,
										    		'tasksArr': tasksArr,
										    		'ganttTasks': ganttTasks
										    	}
										    	resolve(returnResponse)
						    				
					    				}
				    				
				    			}); 

			    			}

		    			});
		    			
	    	});

	    
        
    }, 

    getContactByID: function($contactID){
    	return new Promise(function(resolve, reject){
    		//console.log("Line 800");
    		userModel.getUserById($contactID, function(err, contactData){
    			//console.log("Line 800");
    			resolve(contactData)
	    	})
    	});    	
    },

    getProjectByID: function($projectID){
    	return new Promise(function(resolve, reject){
    		folders.getfolderbyId($projectID, function(err, wsData){
	    		resolve(wsData)
	    	})
    	});    	
    },



    getProjectStatus: function($folderId){
    	return new Promise(function(resolve, reject){
    	var MilestoneStatus = 'Complete';
    	$complete = false;
    	$upcoming = false;
    	$active = false;
	    	
    	taskModel.getTasksByProject($folderId, function(err, data){
    		//console.log("getProjectStatus Function Line 438: ", data);
			if(data.length>0){
				$milestoneIncrement=0;
				async.forEachSeries(data, function(wsdatavalue, callback){
					$milestoneIncrement++;
					if((wsdatavalue['status']=='Active')){
						//console.log('Line 444: Status-Active: ');
						$active = true;
					}
					if(wsdatavalue['status']=='Upcoming'){
						$upcoming = true;
					}								
					if($milestoneIncrement == data.length){
						if($active){
							resolve('Active');
						}else if($upcoming){
							resolve('Upcoming');
						}else{
							resolve('Complete');
						}
						
					}
					callback();								
				});
			}else{
				resolve(MilestoneStatus)
			}
		});
				
		});
    },

    getfolderStatus: function($folderId, $wsData2DataIncrement=0, $active=false, $upcoming=false, $complete=false){
    	return new Promise(function(resolve, reject){
	    	var MilestoneStatus = 'Complete';
	    
	    	folders.getfolderbyId($folderId, function(err, wsData){
	    		taskModel.gettaskbyParentId($folderId, function(err, data){
		    		//console.log("getFolderStatus Function Line 438: ", wsData.title);
					if(data.length>0){
						$milestoneIncrement=0;
						async.forEachSeries(data, function(wsdatavalue, callback){
							//console.log("--483--", $milestoneIncrement, data.length, wsdatavalue['status']);
							$milestoneIncrement++;
							if((wsdatavalue['status']=='Active')){
								//console.log('Line 485: Status-Active: ');
								$active = true;
							}
							if(wsdatavalue['status']=='Upcoming'){
								$upcoming = true;
							}								
							if($milestoneIncrement == data.length){

								folders.getfolderbyParentId($folderId, function(err, data2){
									//console.log("--495--", data2);
									if(data2.length>0){
										//console.log("Line 498", $wsData2DataIncrement, data2.length);
										async.forEachSeries(data2, function(wsdata2value, callback2){
											$wsData2DataIncrement++;
											module.exports.getfolderStatus(wsdata2value['_id'], 0, $complete, $active, $upcoming).then(($data3)=>{
												//console.log("Line 501",data3);
												if($data3=='Active'){
													$active = true;
												}else if($data3=='Upcoming'){
													$upcoming = true;
												}
												//console.log("Line 507",$wsData2DataIncrement, data2.length);
												if($wsData2DataIncrement==data2.length){
													if($active){
														resolve('Active');
													}else if($upcoming){
														resolve('Upcoming');
													}else{
														resolve('Complete');
													}
												}
												callback2()

											});
										});
									}else{
										if($active){
											resolve('Active');
										}else if($upcoming){
											resolve('Upcoming');
										}else{
											resolve('Complete');
										}
									}
									callback()

								})
								
							}else{
								callback()
							}					
						});
					}else{
						folders.getfolderbyParentId($folderId, function(err, data2){

									if(data2.length>0){
										async.forEachSeries(data2, function(wsdata2value, callback2){
											//console.log("--544--",$wsData2DataIncrement, data2.length);
											$wsData2DataIncrement++;
											module.exports.getfolderStatus(wsdata2value['_id'], 0).then(($data3)=>{

												if($data3=='Active'){
													$active = true;
												}else if($data3=='Upcoming'){
													$upcoming = true;
												}
												//console.log("Line 553",$wsData2DataIncrement, data2.length);
												if($wsData2DataIncrement==data2.length){
													if($active){
														resolve('Active');
													}else if($upcoming){
														resolve('Upcoming');
													}else{
														resolve('Complete');
													}
												}
												callback2()
											});
										});
									}else{
										if($active){
											resolve('Active');
										}else if($upcoming){
											resolve('Upcoming');
										}else{
											resolve('Complete');
										}
									}

								})
					}
				});
	    	});	    		
		});
    },

    getTaskFolder: function($tasksData, $foldersData, $taskId){
    	folders = []
    	foldersHtml = ''
    	for(var taskindex in $tasksData){
    		if($taskId == $tasksData[taskindex]['_id']){
    			if($tasksData[taskindex]['superParentIds'].length>0){
    				for(var superParentId in $tasksData[taskindex]['superParentIds']){
    					for(var folderElement in $foldersData){
    						if($foldersData[folderElement]['_id'] == $tasksData[taskindex]['superParentIds'][superParentId]){
    							folders.push($foldersData[folderElement]);
    							foldersHtml += '<a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>';
    						}
    					}
    				}    				
    			}else if($tasksData[taskindex]['parentFolderIds'].length>0){
    				for(var ParentId in $tasksData[taskindex]['parentFolderIds']){
	    				for(var folderElement in $foldersData){
    						if($foldersData[folderElement]['_id'] == $tasksData[taskindex]['parentFolderIds'][ParentId]){
    							folders.push($foldersData[folderElement]);
    							foldersHtml += '<a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>';
    						}
	    				}
	    			1}
    			}else{
    				if($tasksData[taskindex]['subTaskIds'].length>0){
    					for(var subTaskId in  $tasksData[taskindex]['subTaskIds']){
    					    foldersHtml += module.exports.getTaskFolder($tasksData, $foldersData, $tasksData[taskindex]['subTaskIds'][subTaskId])
						}
    				}	
    			}
    		}
    	}
    	return foldersHtml;
    },

    getMilestones: function(moment, $contactsData,$projectId, $folderId, $folderTitle, $projectName, $startDate, $endDate, $authorIds){
    	return new Promise( function(resolve, reject){
    		module.exports.getfolderStatus($projectId).then((milestoneStatus)=>{
	    		tasksbody = ''    	
				tasksbody += '<tr style="height:28px">';
				//tasksbody += '<td style="width: 10%;">'+$projectName+'</td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'
				if(milestoneStatus=="Active"){
					tasksbody += '<i class="fa fa-circle" style="color:green"></i> ';
				}else if(milestoneStatus=="Upcoming"){
					tasksbody += '<i class="fa fa-circle" style="color:yellow"></i> ';
				}else{
					tasksbody += '<i class="fa fa-circle"></i> ';
				}
				tasksbody += '<a href="http://elyvt.com/edit/folderdata/?id='+$folderId+'">'+$folderTitle+'</a></td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+$projectName+'</td>';
				tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+$startDate+'</td>';
		        tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+$endDate+'</td>';
		        tasksbody += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
		        tasksbody += milestoneStatus;	        
		        tasksbody += ''
				//tasksbody += '<td style="width: 10%;">'+$foldersData[folderElement]['title']+'</td>';
				tasksbody += '</tr>';	    		
		    	resolve(tasksbody)
		    });
    	})    	
    },

    buildMilestonesTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){
    	//console.log("i am here...");    	
    	return new Promise(function (resolve, reject) {
	    	taskshead = '<thead>\
						<tr>\
						<th style="width: 30%;">Milestone</th>\
		              <th style="width: 40%;">Project</th>\
		              <th >Status</th>\
		              </tr>'
		    taskbody = '<tbody>';
		    if($folderID != null){
		    	//console.log("Line 646: ", $folderID);
		    	folders.getfolderbyId($folderID, function(value, ProjectData){
	    			$parentFolderId = ProjectData._id;
		    		$projectName = ProjectData.title;
		    		$authorIds = ProjectData.user;
	    			folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
		    			if(wsfolder != null){
		    				$j=0;
			    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
			    				$j++;
			    				//console.log("Line 386", wsfoldervalue.title, wsfolder.length );
				    			$folderTitle = wsfoldervalue.title;	
				    			$folderId = wsfoldervalue._id;
				    			$startDate =  moment(wsfoldervalue.startDate,'MM/DD/YY').format('MM/DD/YY');
				    			$endDate = moment(wsfoldervalue.endDate,'MM/DD/YY').format('MM/DD/YY');
				    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $startDate, $endDate, $authorIds).then(milestoneData => {
				    				console.log($j);
				    				taskbody += milestoneData 
				    				if($j==wsfolder.length){
				    					console.log('resolving');
				    					resolve(taskshead+taskbody)
				    				}
				    				callback2()
			    				});
			    			});
			    		}else{
					    	resolve(taskbody)
					    }
		    		});
	    		})

		    }else{

		    	folders.getprojects(function(err, ProjectsData){
		    	//console.log("Line 382", ProjectsData.length);
		    	//console.log("");
		    	if(ProjectsData != 'undefined'){
			    	if((ProjectsData != null) && (ProjectsData.length>0)){
			    		$projectIncrement=0;
				    	async.forEachSeries(ProjectsData, function(value, callback){
				    		$projectIncrement++;
				    		$parentFolderId = value._id;
				    		$projectName = value.title;
				    		$authorIds = value.user;
				    		//console.log("Line 382", $projectName);
				    		folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
				    			if(wsfolder != null){
				    				$j=0;
					    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
					    				$j++;
					    				//console.log("Line 386", wsfoldervalue.title);
						    			$folderTitle = wsfoldervalue.title;	
						    			$folderId = wsfoldervalue._id;
						    			$startDate =  moment(wsfoldervalue.startDate,'MM/DD/YY').format('MM/DD/YY');
						    			$endDate = moment(wsfoldervalue.endDate,'MM/DD/YY').format('MM/DD/YY');
						    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $startDate, $endDate, $authorIds).then(milestoneData => {
						    				taskbody += milestoneData;
						    				//console.log("Line 496", $projectIncrement, ProjectsData.length , $j, wsfolder.length);
						    				if($projectIncrement==ProjectsData.length && $j==wsfolder.length){
						    					responsetable = taskshead+taskbody;
												resolve(responsetable)
						    				}
					    					callback2();
						    			});
					    				
					    			});
					    		}else{
							    	responsetable = taskshead+taskbody;
									resolve(responsetable)
							    }
				    			callback();
				    		});

				    	});
				    }else{
				    	responsetable = taskshead+taskbody;
						resolve(responsetable)
				    }
			    }		    	
		    });


		    }
		    
			
		});
    },


    buildMilestonesEmailTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){

    	return new Promise(function (resolve, reject) {
	    	taskbody = ''
	    	if($folderID != null){

	    		folders.getfolderbyId($folderID, function(value, ProjectData){
	    			$parentFolderId = ProjectData._id;
		    		$projectName = ProjectData.title;
		    		$authorIds = ProjectData.user;
	    			folders.getfolderbyParentId($parentFolderId, function(err, wsfolder){
		    			if(wsfolder != null){
		    				$j=0;
			    			async.forEachSeries(wsfolder, function(wsfoldervalue, callback2){
			    				$j++;
			    				//console.log("Line 386", wsfoldervalue.title, wsfolder.length );
				    			$folderTitle = wsfoldervalue.title;	
				    			$folderId = wsfoldervalue._id;
				    			$startDate =  moment(wsfoldervalue.startDate,'MM/DD/YY').format('MM/DD/YY');
				    			$endDate = moment(wsfoldervalue.endDate,'MM/DD/YY').format('MM/DD/YY');
				    			module.exports.getMilestones(moment, $contactsData, $parentFolderId, $folderId, $folderTitle, $projectName, $startDate, $endDate, $authorIds).then(milestoneData => {
				    				//console.log($j);
				    				taskbody += milestoneData 
				    				if($j==wsfolder.length){
				    					console.log('resolving');
				    					resolve(taskbody)
				    				}
				    				callback2()
			    				});
			    			});
			    		}else{
					    	resolve(taskbody)
					    }
		    		});

	    		})

	    	}	
		});
    },

    getDashboardfolderTasks :function(moment, $foldersData,  $tasksData, $contactsData){
		tasks = ''
		hastasks = false;
		taskshead = '<thead>\
				<tr>\
	              <th style="width: 30%;">Critical Dates</th>'
	    taskbody = '<tbody>'
	    tasksArr = [];
		for(var folderElement in $foldersData){
			if($foldersData[folderElement]['project']){
				if($foldersData[folderElement]['project']['endDate']){

    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'MM/DD/YY');
    				//!dueDate.isAfter( moment()) &&
    				if(($foldersData[folderElement]['scope']=="WsFolder")){
    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'MM/DD/YY');
    					var daysLeft = dueDate.diff(moment(), 'days');

    					$folderId = $foldersData[folderElement]['_id']
    					//$foldersbreak = false;
    					for(var taskindex in $tasksData){
    						var index = 0;
    						//console.log("Line 907",$tasksData[taskindex]);
    						if($tasksData[taskindex]['parentFolderIds']){
					    		if($tasksData[taskindex]['parentFolderIds'].length>0){
					    			if($tasksData[taskindex]['parentFolderIds'].indexOf($folderId) > -1){
					    				var dueDate = moment($tasksData[taskindex]['dates']['due'],'MM/DD/YY');
					    				//dueDate.isAfter(moment()) && 
	        							if((dueDate.diff(moment(), 'days') <= 40) && $tasksData[taskindex]['status']=="Active"){
	        								hastasks = true;
	        								// if(!$foldersbreak){
	        								// 	taskshead += '<th style="width: 10%;">'+$foldersData[folderElement]['title']+'</th>'
	        								// 	$foldersbreak = true;
	        								// }
	        								if(!tasksArr[$foldersData[folderElement]['title']]){
	        									tasksArr[$foldersData[folderElement]['title']] = {}
	        								}
	        								tasksArr[$foldersData[folderElement]['title']][index] =  $tasksData[taskindex]		
	        								index++;						
	        							}

					    			}
					    		}
					    	}
				    	}


			          }	

			      }
			}    			
		}	

		//console.log(hastasks);

		folderlength = tasksArr.length;
		taskslength = 1;		
		for(var element in tasksArr){
			taskshead += '<th style="width: 10%;">'+element+'</th>'
			if(tasksArr[element].length > taskslength){
				taskslength = tasksArr[element].length;
			}	
		}

				
		for(var element in tasksArr){
			$i=0;
			while($i<taskslength){
				taskbody += '<tr>'
				if(tasksArr[element][$i]){
					taskbody += '<td>'+tasksArr[element][$i]['title']+'</td>'
					for(var element2 in tasksArr){
						if(element2 == element){
							var startDate = moment(tasksArr[element][$i]['dates']['start'],'MM/DD/YY');
							taskbody += '<td>'+startDate.format('DD MMM YYYY')+'</td>'
						}else{
							taskbody += '<td>-</td>'
						}
					}
				}else{
					taskbody += '<td></td>'
				}

				taskbody += '</tr>'	
				$i++;
			}		
		}			

		taskbody += '</tbody>'
		taskshead += '</tr>\
	          </thead>';
	    tasks += taskshead;
	    tasks += taskbody;
	    var returnResponse = {
	    	'hastasks' : hastasks,
	    	'tasks': tasks
	    }
	    returnResponse = JSON.stringify(returnResponse);
	    //console.log(returnResponse) 
	    return returnResponse
    },

    contactsHTML: function(contactsData){
    	return new Promise(function (resolve, reject) {
    	  contactsHTML = ''
		  for(var contactsElement in contactsData){
		    
		  }
		  resolve(contactsHTML);
	   });
    },

    getTasksByStatus: function(moment, $status){
    	return new Promise(function(resolve, reject){ 
    	//console.log("Line 1003", $status);  
	    	taskModel.getTaskbyStatus($status, function(err, completedtaskList){	    		
	    		//console.log("Line 1005", completedtaskList);
		      	 $completedtaskIncrement = 0;
		      	 if((completedtaskList!=null) || (completedtaskList != 'undefined')){
		      	 	if(completedtaskList.length>0){
			      	 async.forEachSeries(completedtaskList, function(completedtask, callback){ 
			      	 	folders.getfolderbyId(completedtask['milestone'], function(err, wsfolder){
					        $completedtaskIncrement++;
					        completedTasksHTML += '<tr>'
					        completedTasksHTML += '<td><a href="/task/?id='+completedtask['_id']+'">'+completedtask['title']+'</a></td>';
					        completedTasksHTML += '<td>';
					        completedTasksHTML += wsfolder['title']
					        completedTasksHTML += '</td>';

					        var contact = module.exports.getContactByID(completedtask['authorIds'])
					         completedTasksHTML += '<td>';
					        if (contact != null){
					          completedTasksHTML += contact['firstname']+' '+contact['lastname'];
					        }
					        completedTasksHTML += '</td>';
					        completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">';
						  	if(completedtask['dates']['due']){
						  		var endDateObj = moment(completedtask['dates']['due'],'MM/DD/YY');
								endDate = endDateObj.format('DD MMM YYYY');
								completedTasksHTML += endDate;
						  	}
							completedTasksHTML +='</td>';
					        completedTasksHTML += '<td>'+completedtask['status']+'</td>'
					        completedTasksHTML += '</tr>'
					        if($completedtaskIncrement == completedtaskList.length){
					        	completedTasksHTML += '</tbody>'
					        	resolve(completedTasksHTML)
					        }
					        callback()
				       });
				      });
			      	}else{
			      		completedTasksHTML += '</tbody>'
				        	resolve(completedTasksHTML)
				    		}
				    }else{
				    	completedTasksHTML += '</tbody>'
				        	resolve(completedTasksHTML)
				    		}
		      })// End Completed Tasks List Fetching
		 });
    },

    folderDashboardContent: function(moment, $foldersData, $tasksData, $contactsData){
    	return new Promise(function (resolve, reject) {
    		//console.log("line 385", typeof($tasksData))
    		
    		var d = new Date();
    		var now = moment(d);
    		var currentDate = moment(d);
    		console.log("moment()",currentDate);
			  //var monthsLists = []
			  var activetaskList = []
			  var completedtaskList = []
			  var upcomingTaskList = []
			  var thisWeekTasks = []
			  var todaysTasks = []
			  var overdueTasks = []
			  var A_WEEK_OLD = now.clone().subtract(7, 'days').startOf('day');
			  var ONE_DAY_OLD = now.clone().subtract(1, 'days').startOf('day');
			  console.log("---1342");
    		var folderDashboardleftMenuHTML = ''
    		var folderDashboardRightShortcutHTML = ''
    		var foldersweeklyCriticalDatesHTML = '';
    		var upcomingTaskHTML = ''
    		var isupcomingTask = false;
    		
    		foldersDashboard = [];
    		 var taskTypes = {'Backlog':0, 'Milestone':0, 'Planned':0}

    		$totalElement = 0;

    		console.log("---1354");
    		$rtl = 0;
			// for(var Element in $tasksData){
			// 	$totalElement++;
				
			// 	if($tasksData[Element]['dates']['type']=="Planned"){
			// 		taskTypes['Planned'] = taskTypes['Planned']+1;
			// 		var dueDate = moment($tasksData[Element]['dates']['due'],'MM/DD/YY');
			// 		if(!dueDate.isAfter( moment()) && $tasksData[Element]['status']=="Active"){
			//               //console.log("Risk Task FOund.", tasksData[Element] )
			//               overdueTasks.push($tasksData[Element])
			//           }
			//       }
			//   }
    		
			  console.log("---1369");
				//monthsLists.reverse()
				activetaskList.reverse()
				completedtaskList.reverse()
				overdueTasks.reverse()

				 completedTasksHTML = '<thead><tr><th>Tasks</th><th>Milestone</th><th>Assignee</th><th>Date Completed</th><th>Status</th></tr></thead></tbody>'
			      $completedTasks = 0;

			      module.exports.getTasksByStatus(moment, 'Completed').then((completedTasksHTML)=>{
			      	//console.log("line 1082", completedTasksHTML);
			      	module.exports.getTasksByStatus(moment, 'Upcoming').then((upcomingTaskHTML)=>{

			      		console.log("line 1082");




			      		 overdueTasksHTML = '<thead><tr><th>Tasks</th><th>Assignee</th><th>Days Past Due</th><th>Status</th></tr></thead></tbody>'
		      $totalOverdueTasks = 0;
		      for(var item in overdueTasks){
		        $totalOverdueTasks++;
		        overdueTasksHTML += '<tr>'
		        overdueTasksHTML += '<td style="color:red"><a href="/task/?id='+overdueTasks[item]['_id']+'">'+overdueTasks[item]['title']+'</a></td>';
		        var contact = module.exports.getContactByID(overdueTasks[item]['authorIds'])
		        overdueTasksHTML += '<td>';
		        if (contact != null){
		          overdueTasksHTML += contact['firstname']+' '+contact['lastname'];
		        }
		        overdueTasksHTML += '</td>';
		        if(overdueTasks[item]['dates']['due']){
			  		
					var startDate = moment(overdueTasks[item]['dates']['start'],"MM/DD/YY");
					var endDate = moment(overdueTasks[item]['dates']['due'],"MM/DD/YY");
					//console.log(overdueTasks[item]['dates']['due'], startDate, endDate,  moment(),endDate.diff(moment(), 'days'),  "Date Difference");
					var daysLeft = endDate.diff(moment(), 'days');
					if (daysLeft<0){
						daysLeftText = "overdue "+daysLeft+" days"
					}else{
						daysLeftText = daysLeft
					}

			  		overdueTasksHTML += '<td>'+daysLeftText+'</td>'
		      	}
		        overdueTasksHTML += '<td>'+overdueTasks[item]['status']+'</td>'
		        overdueTasksHTML += '</tr>'
		      }
		      overdueTasksHTML += '</tbody>'
		      overdueTasksHTML += '<p> Total Overdue Tasks:'+$totalOverdueTasks+'</p>'

		      console.log("__id___ 776__", );


    		for(var folderElement in $foldersData){
    			if($foldersData[folderElement]['project']){
    				if($foldersData[folderElement]['project']['endDate']){
                      if($foldersData[folderElement]['isProject'] == true){
                      	if($foldersData[folderElement]['isDeleted'] == false){
	    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'MM/DD/YY');
	    				//dueDate.isAfter( moment()) &&
	    				if(($foldersData[folderElement]['scope']=="WsFolder")){
	    					if(foldersDashboard.indexOf($foldersData[folderElement]['_id']) == -1){
	    						foldersDashboard.push($foldersData[folderElement]['_id']);	    					
		    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'MM/DD/YY');
		    					var endDate = moment($foldersData[folderElement]['project']['endDate'],'MM/DD/YY');
		    					var daysLeft = dueDate.diff(moment(), 'days');
		    					if (daysLeft<0){
		    						daysLeftText = "overdue "+(-1*daysLeft)+" days"
		    					}else{
		    						daysLeftText = daysLeft+" days";
		    					}
			    				folderDashboardleftMenuHTML += '<div class="x_panel widget widget_'+$foldersData[folderElement]['_id']+'">\
						          <div class="x_title" style="  ">\
						          <div class="title_tast">\
						          	<a href="/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
						          </div>\
						          <div class="clearfix"></div>\
						          </div>\
						          <div class="x_content">\
						          <div style="text-align:right">\
						          <p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 5px;overflow:auto">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Start Date:  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>\
						          <input type="text" value="'+startDate.format("MM/DD/YY")+'" class="startDate" id="startDate_'+$foldersData[folderElement]['_id']+'" onChange="changeStartDate(\''+$foldersData[folderElement]['_id']+'\', this.value, \''+endDate.format("MM/DD/YY")+'\')" style="width: 65px;border:0px"/>\
						          </button></span>\
						          <div class="clearfix"></div>\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">End Date:  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>\
						          <input type="text" value="'+endDate.format("MM/DD/YY")+'" class="endDate" id="endDate_'+$foldersData[folderElement]['_id']+'" onChange="changeStartDate(\''+$foldersData[folderElement]['_id']+'\', \''+startDate.format("MM/DD/YY")+'\',this.value)" style="width: 65px;border:0px"/>\
						          </button></span>\
						          <div class="clearfix"></div>\
						          </p>\
						          <p style="text-align:center;overflow:auto">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						          <span style=" font-size: 16px; color: darkred">'+daysLeftText+'</span>\
						          </p>\
						          </div>\
						          </div>\
						          </div>';	

						          folderDashboardRightShortcutHTML += '<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
								                                    <span><span class="fa fa-file-o"></span></span>\
								                                    <span style="padding-left: 5px;  font-size: 14px; color:#696565;">\
								                                    <a href="/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
								                                    </span>\
								                                  </p>'
							}
				          }	

				      }
				  }
				}
    			}    			
    		}	

console.log("line 1197");
			    		foldersweeklyCriticalDatesHTML += module.exports.getDashboardfolderTasks(moment, $foldersData,  $tasksData, $contactsData);
console.log("line 1199");
			    		returnResponse = {
			    			'folderDashboardleftMenuHTML': folderDashboardleftMenuHTML,
			    			'foldersweeklyCriticalDatesHTML': JSON.parse(foldersweeklyCriticalDatesHTML),
			    			'folderDashboardRightShortcutHTML': folderDashboardRightShortcutHTML,
			    			'completedTasksHTML': completedTasksHTML,
			    			'overdueTasksHTML': overdueTasksHTML,
			    			'upcomingTaskHTML' : upcomingTaskHTML,
			    			'isupcomingTask': isupcomingTask
			    		}
			    		resolve(returnResponse)   

			        });
			      });

 	
        });
    },

    taskGanntChart: function(moment, $tasksData, folderId=null, $contactsData=null, $foldersData=null){
    	return new Promise(function (resolve, reject) {
	    	var tasks = []
	    	if(folderId==null){
	    		_taskData = $tasksData;
	    		//console.log("416", '-------------------')
		    	for(var Element in _taskData){
		    		var __thistaskData = _taskData[Element]
		    		if(__thistaskData['dates'] == 'string'){
		    			var __thistaskDatesArr = __thistaskData['dates'];	    			
		    		}else{
		    			var __thistaskDatesArr = __thistaskData['dates'];	
		    		}
		    		//console.log("416", (__thistaskDatesArr), __thistaskData)
		    		var dependencies = "";
		    		$i = 1;
		    		for(var subfolder in __thistaskData['subTaskIds']){
		    			$i++
		    			 dependencies += __thistaskData['subTaskIds'][subfolder];
		    			 if($i <= __thistaskData['subTaskIds'].length){
		    			 	dependencies += ','
		    			 }
		    		}
		    		dependencies += ""
		    		if(__thistaskData['dates']['start']){
			    		var startDate = moment(__thistaskData['dates']['start'],'MM/DD/YY');
			    		var dueDate = moment(__thistaskData['dates']['due'],'MM/DD/YY');
			    		console.log(startDate, __thistaskData['title']);
			    		var task = {
			    			 id: __thistaskData['_id'],
						    name: __thistaskData['title'],
						    start: startDate,
						    end: dueDate,
						    progress: 100
			    		}

			    		if(__thistaskData['dependencies'].length > 0){
			    			for(var dependencyItem in __thistaskData['dependencies']){
			    				task['dependencies'] += __thistaskData['dependencies'][dependencyItem]+", ";
			    			}			    		 	
			    		}
		    		    		
			    		tasks.push(task)
			    	}
		    	}

		    	tasks.sort(function(a,b){
					  var c = new Date(a.start);
					  var d = new Date(b.start);
					  return c-d;
					});
		    	
		    	resolve(tasks)


	    	}else{
	    		//console.log("Line 398 =========================")
	    		_taskData = [];	
	    		//console.log("Line 944")
				module.exports.getfolderTasks(moment, $tasksData, $contactsData, folderId).then(foldersListHtmlArr => {
					//console.log("Line 403",foldersListHtmlArr['ganttTasks'].length)
					 for(var index in foldersListHtmlArr['ganttTasks']){
					 	_taskData.push(foldersListHtmlArr['ganttTasks'][index])
					 }	

					//console.log("416", '-------------------', _taskData)
			    	for(var Element in _taskData){
			    		var __thistaskData = _taskData[Element]
			    		if(__thistaskData['dates'] == 'string'){
			    			var __thistaskDatesArr = __thistaskData['dates'];	    			
			    		}else{
			    			var __thistaskDatesArr = __thistaskData['dates'];	
			    		}
			    		//console.log("416", (__thistaskDatesArr), __thistaskData)
			    		var dependencies = "";
			    		$i = 1;
			    		for(var subfolder in __thistaskData['subTaskIds']){
			    			$i++
			    			 dependencies += __thistaskData['subTaskIds'][subfolder];
			    			 if($i <= __thistaskData['subTaskIds'].length){
			    			 	dependencies += ','
			    			 }
			    		}
			    		dependencies += ""
			    		if(__thistaskData['dates']['type']){
				    		var startDate = moment(__thistaskData['dates']['start'],'MM/DD/YY');
				    		var dueDate = moment(__thistaskData['dates']['due'],'MM/DD/YY');
				    		var task = {
				    			 id: __thistaskData['_id'],
							    name: __thistaskData['title'],
							    start: startDate.format('MM/DD/YY'),
							    end: dueDate.format('MM/DD/YY'),
							    progress: 100
				    		}

				    		task['dependencies'] = '';
				    		if(__thistaskData['dependencyIds']){
				    			//if(typeof __thistaskData['dependencyIds'] == "String"){
					    				task['dependencies'] += __thistaskData['dependencyIds'];

				    			// }else{
				    			// 	for(var dependencyItem in __thistaskData['dependencyIds']){
					    		// 		task['dependencies'] += __thistaskData['dependencyIds'][dependencyItem]+", ";
					    		// 	}
				    			// }
				    						    		 	
				    		}
			    		    		
				    		tasks.push(task)
				    	}
			    	}

			    	tasks.sort(function(a,b){
						  var c = new Date(a.start);
						  var d = new Date(b.start);
						  return c-d;
						});
			    	
			    	resolve(tasks)


				});				
		    			
	    	}
	    	
	    })
    },

    taskReminderEmailTable: function(moment, tasksData, contactsData){
    	return new Promise(function (resolve, reject) {
	    	var A_WEEK_later = moment().add(7, 'days').startOf('day');
	    	var reminderTaskList = [];
	    	var reminderTaskListhtml = '';
	    	$totalElement=0;
	    	async.forEachSeries(tasksData, function(value, callback){
				$totalElement++;
				if(value['dates']['type']=="Planned"){
					var dueDate = moment(value['dates']['due'],'MM/DD/YY');
					//console.log("====", dueDate.isBefore(A_WEEK_later), value['title']);
					if(dueDate.isBefore(A_WEEK_later) && value['status']=="Active"){
						reminderTaskList.push(value);
			            reminderTaskListhtml += '<tr>'
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+value['title']+'</td>';
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+dueDate.clone().format('MM/DD/YY')+'</td>';
				      	var contact = module.exports.getContactByID(value['authorIds'])
				      	if (contact != null){
				      		reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstname']+' '+contact['lastname']+'</td>'
				      	}
				      	reminderTaskListhtml += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+value['status']+'</td>'
				      	reminderTaskListhtml += '</tr>'
			          }
			      }
			      if($totalElement == tasksData.length){
			      	resolve(reminderTaskListhtml)
			      }
			      
			     callback();
			  });
			  
		});
    },

    buildUserRoleData(users) {
    	return users.reduce((acc, user) => {
    		if (user.roles) {
    			for(var item in user.roles){
    				if(typeof user.roles[item].title !== 'undefined'){
    					//console.log("--", user.roles[item].title);
	    				acc[user.roles[item].title] = acc[user.roles[item].title] ? acc[user.roles[item].title] + 1 : 1
	    			}
	    		}
    		} else {
    			acc.NoRoles += 1
    		}

    		return acc
    	}, { NoRoles: 0 })
    },

    emailActiveTaskList: function(moment, activetaskList){
    	return new Promise(function(resolve, reject){
    		console.log("Line 1693");
    		activetaskListHTML = '';
    		$breakActivehtml = 0;
    		if(activetaskList.length>0){
	    		async.forEachSeries(activetaskList, function(activeTaskElement, callbackActive){		
	    			if(activeTaskElement['dates']['start']){
						var startDate = moment(activeTaskElement['dates']['start'],'MM/DD/YY');

						activetaskListHTML += '<div class="x_panel widget">\
						<div class="x_title" style="  ">\
						<ul class="nav navbar-right panel_toolbox" style="margin-right:-7px; */  min-width: 50px;">\
						<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>\
						</li>\
						<li><a class="close-link"><i class="fa fa-close"></i></a>\
						</li>\
						</ul>\
						<div class="title_tast"><a href="/task/?id='+activeTaskElement['_id']+'">'+activeTaskElement['title']+'</a></div>\
						<div class="clearfix"></div>\
						</div>\
						<div class="x_content">\
						<div >\
						<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Opening Date:  </span>\
						<span><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+startDate.format("MM/DD/YY")+'</button></span>\
						</p>\
						<p>\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						<span style=" font-size: 16px; color: darkred">66</span>\
						</p>\
						</div>\
						</div>\
						</div>';

		          //$("#tasks-left-panel").append(activetaskListHTML);
		          $breakActivehtml++;
		          if($breakActivehtml > 10){
		          	resolve(activetaskListHTML);
		          	callbackActive();
		          }else{
		          	callbackActive()
		          }
		      }else{
		      	callbackActive()
		      }
    		});
	    }else{
	    	resolve(activetaskListHTML)
	    }
    })
  },

  emailCompletedTaskList: function(moment, contactsData,  completedtaskList){
    	return new Promise(function(resolve, reject){
    		console.log("Line 1745");
    		completedTasksHTML = '';
    		$breakActivehtml = 0;
    		if(completedtaskList.length>0){
	    		async.forEachSeries(completedtaskList, function(activeTaskElement, callbackActive){		
	    				completedTasksHTML += '<tr>'
					  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"><a href="http://elyvt.com/tasks/task?id='+activeTaskElement['_id']+'">'+activeTaskElement['title']+'</a></td>';
					  	module.exports.getProjectByID(activeTaskElement['project']).then(projectData=>{
							module.exports.getContactByID(activeTaskElement['authorIds']).then(contact=>{

								if (projectData != null){
							      		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+projectData['title']+'</td>'
						      	}else{
							  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
							  	}
								if ((contact != null) && (typeof contact !== "undefined")){
							  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstname']+' '+contact['lastname']+'</td>'
							  	}else{
									  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
									  	}
							 if(typeof activeTaskElement['dates'] != "undefined"){
								  completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['dates']['start']+'</td>'
								  completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['dates']['due']+'</td>'
							  }
							  completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['status']+'</td>'
							  completedTasksHTML += '</tr>'

					          $breakActivehtml++;
					          if(($breakActivehtml > 15)|| ($breakActivehtml == completedtaskList.length)){
					          	resolve(completedTasksHTML);
					          	callbackActive();
					          }else{
					          	callbackActive()
					          }		  

							});
					  	});						
    		});
	    }else{
	    	resolve(completedTasksHTML)
	    }
    })
  },

  emailUpcomingTaskList: function(moment, contactsData,  tasksData){
    	return new Promise(function(resolve, reject){
    		console.log("Line 1788");
    		$k=0;
			upcomingTaskHTML = ''
			async.forEachSeries(tasksData, function(taskelement, callbackActive){		
				$k++;
				if(typeof taskelement['dates'] != "undefined"){
					var startDate = moment(taskelement['dates']['start'],'MM/DD/YY');
					//
					console.log("Upcoming Tasks: "+taskelement['status']);
	    			if(taskelement['status']=="Upcoming"){
	    				//console.log("*****************************************");
	    				module.exports.getProjectByID(taskelement['project']).then(projectData=>{
	    					module.exports.getContactByID(taskelement['authorIds']).then(contact=>{
				      			isupcomingTask = true;
			    				upcomingTaskHTML += '<tr>\
					                                    <td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"><a href="http://elyvt.com/tasks/task?id='+taskelement['_id']+'">'+taskelement['title']+'</a></td>'
					            if (projectData != null){
						      		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+projectData['title']+'</td>'
						      	}else{
							  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
							  	}
							  	if (contact != null){
							  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstname']+' '+contact['lastname']+'</td>'
							  	}else{
							  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
							  	}
				                var startDate = '-'
							  	var endDate = '-'
							  	if(taskelement['dates']['start']){
							  		if(taskelement['dates']['start'].length > 9){
							  			var startDateObj = moment(taskelement['dates']['start'],'DD/MM/YYYY');
									
							  		}else{
							  			var startDateObj = moment(taskelement['dates']['start'],'MM/DD/YY');
										
							  		}
							  		startDate = startDateObj.format('MM/DD/YY');
							  	}
							  	upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+startDate+'</td>';				  	

							  	if(taskelement['dates']['due']){
							  		var endDateObj = moment(taskelement['dates']['due'],'MM/DD/YY');
									endDate = endDateObj.format('MM/DD/YY');
							  	}
							  	upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+endDate+'</td>';				  	


							  	if(taskelement['dates']['due']){
							  		var endDateObj = moment(taskelement['dates']['due'],'MM/DD/YY');
									endDate = endDateObj.format('MM/DD/YY');
									var daysLeft =0;
									var startDate = moment(taskelement['dates']['start'],'MM/DD/YY');
			    					var endDate = moment(taskelement['dates']['due'],'MM/DD/YY');
			    					daysLeft = endDate.diff(moment(), 'days');
			    					if (daysLeft<0){
			    						daysLeftText = daysLeft+" days"
			    					}else{
			    						daysLeftText = daysLeft
			    					}

							  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+daysLeftText+'</td>'
						      	}
					                upcomingTaskHTML += '</tr>';
					                console.log($k, tasksData.length, $k == tasksData.length);
					    			if($k == tasksData.length){
					    				resolve(upcomingTaskHTML)
					    				//callbackActive()
					    			}else{
					    				console.log($k, tasksData.length, $k == tasksData.length);
					    				callbackActive()
					    			}
			    			
				      		})
	    				})
	    				}else{
			    				if($k == tasksData.length){
				    				console.log($k, tasksData.length, $k == tasksData.length);
				    				resolve(upcomingTaskHTML)
				    				//callbackActive()
				    			}else{
				    				console.log($k, tasksData.length, $k == tasksData.length);
				    				callbackActive()
				    			}
				      	
						      	
	    			}    			
	    		}else{
	    			if($k == tasksData.length){
	    				console.log($k, tasksData.length, $k == tasksData.length);
	    				resolve(upcomingTaskHTML)
	    				//callbackActive()
	    			}else{
		    			console.log($k, tasksData.length, $k == tasksData.length);
		    			callbackActive();
		    		}
	    		}
			});
    })
  },

  emailOverdueTaskList: function(moment, contactsData,  overdueTasks){
    	return new Promise(function(resolve, reject){
    		console.log("Line 1860");
    		completedTasksHTML = '';
    		$breakActivehtml = 0;
    		if(overdueTasks.length>0){
	    		async.forEachSeries(overdueTasks, function(activeTaskElement, callbackActive){		
	    				console.log("Line 1865");
	    				if(typeof activeTaskElement['dates'] != "undefined"){
	    					completedTasksHTML += '<tr>'
						  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"><a href="http://elyvt.com/tasks/task?id='+activeTaskElement['_id']+'">'+activeTaskElement['title']+'</a></td>';
						  	module.exports.getProjectByID(activeTaskElement['project']).then(projectData=>{
								module.exports.getContactByID(activeTaskElement['authorIds']).then(contact=>{
									console.log("Line 1876");
									if (projectData != null){
								      		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+projectData['title']+'</td>'
							      	}else{
								  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
								  	}
									if ((contact != null) && (typeof contact !== "undefined")){
								  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstname']+' '+contact['lastname']+'</td>'
								  	}else{
										  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"></td>'
										  	}
								  if(typeof activeTaskElement['dates'] != "undefined"){
									  completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['dates']['start']+'</td>'
									  completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['dates']['due']+'</td>'
								  
									  if(activeTaskElement['dates']['due']){
								  		var endDateObj = moment(activeTaskElement['dates']['due'],'MM/DD/YY');
										endDate = endDateObj.format('MM/DD/YY');
										var daysLeft =0;
										var startDate = moment(activeTaskElement['dates']['start'],'MM/DD/YY');
				    					var endDate = moment(activeTaskElement['dates']['due'],'MM/DD/YY');
				    					daysLeft = endDate.diff(moment(), 'days');
				    					if (daysLeft<0){
				    						daysLeftText = (-1*daysLeft)+" days"
				    					}else{
				    						daysLeftText = daysLeft
				    					}

								  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+daysLeftText+'</td>'
							      	}
							      }
						      	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+activeTaskElement['status']+'</td>'
								  	completedTasksHTML += '</tr>'

						          $breakActivehtml++;
						          console.log($breakActivehtml, overdueTasks.length, $breakActivehtml == overdueTasks.length);
						          if(($breakActivehtml > 15)||($breakActivehtml >= overdueTasks.length)){
						          	console.log($breakActivehtml,"--");
						          	resolve(completedTasksHTML);
						          	//callbackActive();
						          }else{
						          	console.log($breakActivehtml, overdueTasks.length, $breakActivehtml == overdueTasks.length);
						          	console.log($breakActivehtml,"--");
						          	callbackActive();
						          }		  

								});
					  	});	
					  }else{
					  	callbackActive();
					  }					
    		});
	    }else{
	    	console.log("Line 1896");
	    	resolve(completedTasksHTML);
	    	callbackActive()
	    }
    })
  },

    tasksEmailContent: function(moment, $folders, $tasks, $contacts){
    	return new Promise(function (resolve, reject) {

    		// initalise variables
		  var tasksData = $tasks
		  var contactsData = $contacts

		  var now = moment();
		  //var monthsLists = []
		  var activetaskList = []
		  var completedtaskList = []
		  var upcomingTaskList = []
		  var thisWeekTasks = []
		  var todaysTasks = []
		  var overdueTasks = []
		  var A_WEEK_OLD = now.clone().subtract(7, 'days').startOf('day');
		  var ONE_DAY_OLD = now.clone().subtract(1, 'days').startOf('day');

		  var taskTypes = {'Backlog':0, 'Milestone':0, 'Planned':0}

    		$totalElement = 0;
    		$rtl = 0;
    		async.forEachSeries(tasksData, function(taskelement, callback){		
    			console.log("---1");
    			$totalElement++;
    				var d = moment(taskelement['createdDate'],'MM/DD/YY');
    				if(taskelement['status']=="Completed"){
    					completedtaskList.push(taskelement)
    				}
    				if(taskelement['status']=="Active"){
    					activetaskList.push(taskelement)
    				}    				

    				var month = d.format('M');
    				var year = d.format('YYYY');
    				var lastmonth = d.clone().subtract(1, 'months').format('MMM YYYY');

    				if (d.isAfter(A_WEEK_OLD)){
    					thisWeekTasks.push(taskelement)
    				}

    				if (d.isAfter(ONE_DAY_OLD)){
    					todaysTasks.push(taskelement)
    				}

    				if(typeof taskelement['dates'] != "undefined"){
	    				if(taskelement['dates']['type']=="Backlog"){
	    					taskTypes['Backlog'] = taskTypes['Backlog']+1;
	    				}
	    				if(taskelement['dates']['type']=="Milestone"){
	    					taskTypes['Milestone'] = taskTypes['Milestone']+1;
	    				} 
	    				if(taskelement['dates']['type']=="Planned"){
	    					taskTypes['Planned'] = taskTypes['Planned']+1;
	    					var dueDate = moment(taskelement['dates']['due'],'MM/DD/YY');
	    					if(!dueDate.isAfter( moment()) && taskelement['status']=="Active"){
					              overdueTasks.push(taskelement)
					          }
					      }
					   }
				      console.log("---2");
				    if($totalElement == tasksData.length){

				    	activetaskList.reverse();
						completedtaskList.reverse();
						overdueTasks.reverse();

						activetaskListHTML = ''
						console.log("---3");
						module.exports.emailActiveTaskList(moment, activetaskList).then(activetaskHTML=>{
							activetaskListHTML += activetaskHTML;
							console.log("---4");
							module.exports.emailCompletedTaskList(moment, contactsData, completedtaskList).then(completedTasksHTML=>{
								console.log("---5");
								module.exports.emailOverdueTaskList(moment, contactsData, overdueTasks).then(overdueTasksHTML=>{
									module.exports.emailUpcomingTaskList(moment, contactsData, tasksData).then(upcomingTaskHTML=>{
											var returnData = {
									      	'completedtaskHTML': completedTasksHTML,
									      	'overdueTasksHTML': overdueTasksHTML,
									      	'upcomingTaskHTML': upcomingTaskHTML
									      }
									      resolve(returnData)
									});
								});

							})
						})
	
				}

				console.log("---6");
				callback()
    		});				
    			
				
			      

			  });

	}
}
