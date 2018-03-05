var request = require('request');
const util = require('util');
var folders = require('../models/folders');

module.exports = {


	foldersHeierarcy: function($foldersData, $folderId=null){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = ""
			//console.log("Line no 14",$foldersData)
			for(var foldersElement in $foldersData){
				//if((__thisfoldersData['scope']=="WsRoot")|| __thisfoldersData['scope']=="RbRoot"){
				//console.log("Line no 14",foldersElement,  $foldersData[foldersElement]['_id'])
				var __thisfoldersData = $foldersData[foldersElement]
				if((__thisfoldersData['scope']=="WsRoot")){
					$childrens = []
					foldersListHtml += '<ul class="nav child_menu">';					
					for(var subfolder in __thisfoldersData['childIds']){
						//console.log("Line no 14",foldersElement,  __thisfoldersData['childIds']['_id'])
						for(var foldersElement2 in $foldersData){
							//console.log("Line no 14",$foldersData[foldersElement2])
							if(($foldersData[foldersElement2]['_id']==__thisfoldersData['childIds'][subfolder])){
								foldersListHtml += "<li class=\"sub_menu\">"
								if ($foldersData[foldersElement2]['childIds'].length > 0) {
									foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>" 
								}else{
									foldersListHtml += "<a href=\"/folders/?id="+$foldersData[foldersElement2]['_id']+"\"><span class=\"fa fa-circle\"></span>"
								}
								foldersListHtml += $foldersData[foldersElement2]['title']
								foldersListHtml += "</a>" 
								foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1)
								foldersListHtml += '</li>'
								$childrens.push($foldersData[foldersElement2]) 	

							}

						}
					}

					foldersListHtml += '</ul>'
					__thisfoldersData['childrens'] = $childrens
					foldersList.push(__thisfoldersData);		      
				}
			}
			resolve(foldersListHtml)
		})
	},

	// foldersHeierarcy: function($foldersData, $folderId=null){
	// 	return new Promise(function (resolve, reject) {
	// 		foldersList = []
	// 		foldersListHtml = ""
	// 		for(var foldersElement in $foldersData){
	// 			var __thisfoldersData = $foldersData[foldersElement]
	// 			if((__thisfoldersData['scope']=="WsRoot")){
	// 				$childrens = []
	// 				foldersListHtml += '<ul class="nav child_menu">';
	// 				  foldersListHtml += "<li class=\"sub_menu\">"
	// 				  		module.exports.getChildFolder(__thisfoldersData['_id']).then((childData)=>{
	// 					  		console.log(childData['childArr']);
	// 							if (childData['childArr'].length > 0) {
	// 							 	foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>" 
	// 							 }else{
	// 								foldersListHtml += "<a href=\"/folders/?id="+__thisfoldersData['_id']+"\"><span class=\"fa fa-circle\"></span>"
	// 							}
	// 							foldersListHtml += __thisfoldersData['title']
	// 							foldersListHtml += "</a>" 
	// 							foldersListHtml += childData['childHtml']
	// 							foldersListHtml += '</li>'
	// 							//$childrens.push(__thisfoldersData) 	
	// 						});
	// 					//}
	// 				//}
	// 				foldersListHtml += '</ul>'
	// 				foldersList.push(__thisfoldersData);		      
	// 			}
	// 		}
	// 		resolve(foldersListHtml)
	// 	})
	// },

	// getChildFolder: function($folderId){
	// 	return new Promise(function(resolve, reject){
	// 		folders.getfolderbyParentId($folderId, function(err, $foldersData){
	// 			//console.log("--------------", $foldersData, err)
	// 			$childArr = []
	// 			foldersHTML = '';
	// 			foldersListHtml = '<ul class="folderDetails nav child_menu">'       
	// 			for(var subfolder in $foldersData){
	// 				//console.log(")))_______------------", $foldersData[subfolder]['_id'])
	// 				$childArr.push(String($foldersData[subfolder]['_id']));
	// 					foldersListHtml += "<li>"
	// 						// if ($foldersData[foldersElement2]['childIds'].length > 0) {
	// 						// 	foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>" 
	// 						// }else{
	// 							foldersListHtml += "<a href=\"/folders/?id="+$foldersData[subfolder]['_id']+"\"><span class=\"fa fa-circle\"></span>"
	// 						// }

	// 						foldersListHtml += $foldersData[subfolder]['title']+"</a>" 
	// 						//$foldersData[foldersElement2]['childrens'] = module.exports.getsubfolder(foldersElement2,$foldersData, 1)		            
	// 						//foldersListHtml += module.exports.getChildFolder($foldersData[subfolder]['_id'])	
	// 						foldersListHtml += '</li>'					
							
	// 			}
	// 			foldersListHtml += '</ul>'
	// 			returnResponse = {
	// 				'childArr': $childArr,
	// 				'childData': foldersListHtml
	// 			}
	// 			//console.log("==================",returnResponse)
	// 			resolve(returnResponse)
	// 		});
	// 	});
	// },

	foldersDetails: function(moment, $tasksData, $foldersData, $contactsData, $folderId){
		return new Promise(function (resolve, reject) {
			foldersList = []
			foldersListHtml = "";
			foldersTasksListHtml = "";
			//$foldersData = JSON.parse($foldersData)
			for(var foldersElement in $foldersData){
				if($foldersData[foldersElement]['_id']==$folderId){
					$childrens = []
					foldersListHtml = '<div class="x_panel">\
					<div class="x_title">'
					foldersListHtml += "<h2>"+$foldersData[foldersElement]['title']+"</h2>"
					foldersListHtml += '<div class="clearfix"></div>\
					</div>'
					foldersListHtml += '<div class="x_content">'
					foldersListHtml += '<ul class="folderDetails child_menu">'
					if($foldersData[foldersElement]['childIds']){
						if($foldersData[foldersElement]['childIds'].length > 0)		{
							for(var subfolder in $foldersData[foldersElement]['childIds']){
								for(var foldersElement2 in $foldersData){
									if($foldersData[foldersElement2]['_id']==$foldersData[foldersElement]['childIds'][subfolder]){
										foldersListHtml += "<li><a><i class='fa fa-folder' onclick=\"window.location.href='/folders/?id="+$foldersData[foldersElement2]['_id']+"' \"></i>"+$foldersData[foldersElement2]['title']+"</a>" 
							            //$foldersData[foldersElement2]['childrens'] = module.exports.getsubfolder(foldersElement2,$foldersData, 1)
							            foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1)
							            foldersListHtml += '</li>'
							            $childrens.push($foldersData[foldersElement2]) 	

							        }

							    }
							}
						}
					}
					foldersListHtml += '</ul>'	

					//$tasksData = JSON.parse($tasksData)
					//$contactsData = JSON.parse($contactsData)
			      //console.log("Line 77",$tasksData)
			       foldersTasksListHtml += '<table class="table table-striped projects">\
							<thead>\
							<tr>\
							<th style="width: 1%">#</th>\
							<th >Task</th>\
							<th>Author</th>\
							<th>Status</th>\
							</tr>\
							</thead>\
							<tbody>';

				 // if($foldersData[foldersElement]['childIds']){
				 // 	if($foldersData[foldersElement]['childIds'].length > 0){
	    // 				for(var subfolderIndex in $foldersData[foldersElement]['childIds'])
	    // 				{
	    					foldersListHtmlArr = module.exports.getfolderTasks(moment, $tasksData, $contactsData, $foldersData[foldersElement]['_id'])
	    					//console.log(foldersListHtmlArr)
	    					foldersTasksListHtml += foldersListHtmlArr['tasks']
	    // 				}
	    // 			}
				 // }
				   
			     
			      foldersTasksListHtml += "</tbody>\
			      						</table>"
    	

			      foldersListHtml += '</div>\
			      </div>'

			      $foldersData[foldersElement]['childrens'] = $childrens
			      foldersList.push($foldersData[foldersElement]);		      
			  }
			}
			returnResponse = {
				'foldersListHtml':foldersListHtml,
				'foldersTasksListHtml': foldersTasksListHtml		
			}
			resolve(returnResponse)
		})
	},


	getsubfolder :function(foldersElement,$foldersData, level=1){
		foldersHTML = '';
		foldersListHtml = '<ul class="folderDetails nav child_menu">'       

		for(var subfolder in $foldersData[foldersElement]['childIds']){
			$childrens = []
			for(var foldersElement2 in $foldersData){ 
				if($foldersData[foldersElement2]['_id']==$foldersData[foldersElement]['childIds'][subfolder]){

					foldersListHtml += "<li>"
					if ($foldersData[foldersElement2]['childIds'].length > 0) {
						foldersListHtml += "<a><span class=\"fa fa-chevron-down\"></span>" 
					}else{
						
						foldersListHtml += "<a href=\"/folders/?id="+$foldersData[foldersElement2]['_id']+"\"><span class=\"fa fa-circle\"></span>"
					}

					foldersListHtml += $foldersData[foldersElement2]['title']+"</a>" 
			//$foldersData[foldersElement2]['childrens'] = module.exports.getsubfolder(foldersElement2,$foldersData, 1)		            
			foldersListHtml += module.exports.getsubfolder(foldersElement2,$foldersData, 1)	
			foldersListHtml += '</li>'
			$childrens.push($foldersData[foldersElement2]) 
			
		}
	}
}
foldersListHtml += '</ul>'
return foldersListHtml

},

getProjects: function(moment, $foldersData, $contactsData){
	return new Promise(function (resolve, reject) {
		var foldersArr = []
		var foldersTableHTML = '<table class="table table-responsive table-striped">\
		<tr>\
		<th>Title</th>\
		<th>Start Data</th>\
		<th>End Date</th>\
		<th>Author</th>\
		<th>Status</th>\
		</tr>'
		for(var folderElement in $foldersData){
			if( ($foldersData[folderElement]['project']) && ($foldersData[folderElement]['scope']=='WsFolder')){
				var startDate = '-'
				var endDate = '-'
				if($foldersData[folderElement]['project']['startDate']){
					var startDateObj = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm');
					startDate = startDateObj.format('DD MMM YYYY');
				}
				if($foldersData[folderElement]['project']['endDate']){
					var endDateObj = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm');
					endDate = endDateObj.format('DD MMM YYYY')
				}
				var contact = module.exports.getContactByID($contactsData, $foldersData[folderElement]['project']['authorId'])
				var contactName = '-'
				if (contact != false){
					contactName = contact['firstName']+' '+contact['lastName'];
				}
				foldersTableHTML += "<tr>\
				<td><a href='/folders/?id="+$foldersData[folderElement]['_id']+"'>"+$foldersData[folderElement]['title']+"</a></td>\
				<td>"+startDate+"</td>\
				<td>"+endDate+"</td>\
				<td>"+contactName+"</td>\
				<td>"+$foldersData[folderElement]['project']['status']+"</td>\
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


getfolderTasks :function(moment, $tasksData, $contactsData,  $folderId){
	tasks = ''
	tasksArr = []
		//console.log("Line 122", $folderId)
    	//console.log($tasksData)
    	for(var taskindex in $tasksData){
    		if($tasksData[taskindex]['parentIds']){
	    		if($tasksData[taskindex]['parentIds'].length>0){
	    			for(var parent in $tasksData[taskindex]['parentIds']){
	    				console.log($tasksData[taskindex]['parentIds'], $folderId, $tasksData[taskindex]['parentIds'].indexOf($folderId))
	    		
		    			if($tasksData[taskindex]['parentIds'][parent].indexOf($folderId) > -1){
		    				//console.log('folder Found', $tasksData[taskindex]);
		    				tasksArr.push($tasksData[taskindex]);
		    				tasks += '<tr><td>#</td>';
		    				tasks += '<td><a href="/task/?id='+$tasksData[taskindex]['_id']+'">'+$tasksData[taskindex]['title']+'</a><br />';
		    				var d = moment($tasksData[taskindex]['createdDate'],'YYYY-MM-DDTHH:mm');
		    				tasks += '<small>Created '+d.format('DD MMM,  YYYY')+'</small</td>'
		    				var contact = module.exports.getContactByID($contactsData, $tasksData[taskindex]['authorIds'])
		    				if (contact != false){
		    					tasks += '<td>'+contact['firstName']+' '+contact['lastName']+'</td>'
		    				}
		    				//tasks += '<td>'+$tasksData[taskindex]['accountId']+'</td>'
		    				if ($tasksData[taskindex]['status']=='Completed'){
		    					tasks += '<td><button class="btn btn-success btn-xs">'+$tasksData[taskindex]['status']+'</button></td>'
		    				}else{
		    					tasks += '<td>'+$tasksData[taskindex]['status']+'</td>'
		    				}
		    				tasks += '</tr>'
		    			}
		    		}
	    		}
	    	}
    		else{
    			tasks += "<tr> There are no Tasks in this folder</tr>"
    		}
    	}
    	returnResponse = {
    		'tasks': tasks,
    		'tasksArr': tasksArr
    	}
    	return returnResponse
    },


    getallTasks :function(moment, $tasksData, $contactsData){
	tasks = ''
	tasksArr = []
		//console.log("Line 122", $folderId)
    	//console.log($tasksData)
    	for(var taskindex in $tasksData){
    		if($tasksData[taskindex]['parentIds']){
	    		if($tasksData[taskindex]['parentIds'].length>0){
	    			for(var parent in $tasksData[taskindex]['parentIds']){
	    					console.log($tasksData[taskindex]['parentIds'], $folderId, $tasksData[taskindex]['parentIds'].indexOf($folderId))
	    		
		    				//console.log('folder Found', $tasksData[taskindex]);
		    				tasksArr.push($tasksData[taskindex]);
		    				tasks += '<tr><td>#</td>';
		    				tasks += '<td><a href="/task/?id='+$tasksData[taskindex]['_id']+'">'+$tasksData[taskindex]['title']+'</a><br />';
		    				var d = moment($tasksData[taskindex]['createdDate'],'YYYY-MM-DDTHH:mm');
		    				tasks += '<small>Created '+d.format('DD MMM,  YYYY')+'</small</td>'
		    				var contact = module.exports.getContactByID($contactsData, $tasksData[taskindex]['authorIds'])
		    				if (contact != false){
		    					tasks += '<td>'+contact['firstName']+' '+contact['lastName']+'</td>'
		    				}
		    				//tasks += '<td>'+$tasksData[taskindex]['accountId']+'</td>'
		    				if ($tasksData[taskindex]['status']=='Completed'){
		    					tasks += '<td><button class="btn btn-success btn-xs">'+$tasksData[taskindex]['status']+'</button></td>'
		    				}else{
		    					tasks += '<td>'+$tasksData[taskindex]['status']+'</td>'
		    				}
		    				tasks += '</tr>';		    			
		    		}
	    		}
	    	}
    		else{
    			tasks += "<tr> There are no Tasks in this folder</tr>"
    		}
    	}
    	returnResponse = {
    		'tasks': tasks,
    		'tasksArr': tasksArr
    	}
    	return returnResponse
    },

    getContactByID: function($contactsData, $contactID){
    	//console.log($contactID)
    	for(var contactsElement in $contactsData['data']){
    		if($contactID==$contactsData['data'][contactsElement]['_id']){
    			return $contactsData['data'][contactsElement];
    		}
    	}
    	return false;
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
    			}else if($tasksData[taskindex]['parentIds'].length>0){
    				for(var ParentId in $tasksData[taskindex]['parentIds']){
	    				for(var folderElement in $foldersData){
    						if($foldersData[folderElement]['_id'] == $tasksData[taskindex]['parentIds'][ParentId]){
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

    getMilestones: function(moment, $foldersData, $tasksData, $contactsData, $projectID, $projectName, $authorIds){
    	tasksbody = ''
    	for(var folderElement in $foldersData){
    		if($projectID == $foldersData[folderElement]['_id']){
    			tasksbody += '<tr style="height:28px">';
    			//tasksbody += '<td style="width: 10%;">'+$projectName+'</td>';
    			tasksbody += '<td>'+$foldersData[folderElement]['title']+'</td>';
    			tasksbody += '<td >'+$projectName+'</td>';
    			var contact = module.exports.getContactByID($contactsData, $authorIds)
		         tasksbody += '<td>';
		        if (contact != false){
		          tasksbody += contact['firstName']+' '+contact['lastName'];
		        }
		        tasksbody += ''
    			//tasksbody += '<td style="width: 10%;">'+$foldersData[folderElement]['title']+'</td>';
    			tasksbody += '</tr>'
    		}
    	}

    	// for(var taskindex in $tasksData){
    	// 	if($tasksData[taskindex]['parentIds'].length>0){
    	// 		console.log("Line 287", $tasksData[taskindex]['id'], $tasksData[taskindex]['parentIds'].indexOf($projectID), ($projectID));			
    	// 		if($tasksData[taskindex]['parentIds'].indexOf($projectID) > -1){
    	// 			console.log("Line 289", $tasksData[taskindex]['id'], $tasksData[taskindex]['parentIds']);
					// var dueDate = moment($tasksData[taskindex]['dates']['due'],'YYYY-MM-DDTHH:mm');
    	// 			//if($tasksData[taskindex]['status']=="Active"){
					// hastasks = true;
					// tasksbody += '<tr>';
					// tasksbody += '<td style="width: 10%;">'+$tasksData[taskindex]['title']+'</td>';
					// tasksbody += '<td style="width: 10%;">'+dueDate.format('DD MMM YYYY')+'</td>';
					// tasksbody += '</tr>'
					// //}
    	// 		}
    	// 	}
    	// }
    	return tasksbody
    },

    buildMilestonesTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){

    	return new Promise(function (resolve, reject) {
	    	taskshead = '<thead>\
						<tr>\
						<th style="width: 30%;">Milestone</th>\
		              <th style="width: 40%;">Project</th>\
		              <th >Author</th>\
		              </tr>'
		    taskbody = '<tbody>'
	    	for(var folderElement in $foldersData){
				if($foldersData[folderElement]['project']){
					if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
						if($foldersData[folderElement]['project']['endDate']){					
					    	if($folderID == null){
					    		//console.log("Line 315", $foldersData[folderElement]['id']);
					    		if($foldersData[folderElement]['childIds'].length > 0){
				    				for(var subfolderIndex in $foldersData[folderElement]['childIds'])
				    				{
						    			taskbody += module.exports.getMilestones(moment, $foldersData,  $tasksData, $contactsData, $foldersData[folderElement]['childIds'][subfolderIndex], $foldersData[folderElement]['title'], $foldersData[folderElement]['project']['authorId']);
						    			
						    		}
					    		}
					    	}else{
					    		if($folderId == $foldersData[folderElement]['_id']){
					    			if($foldersData[folderElement]['childIds'].length > 0){
					    				for(var subfolderIndex in $foldersData[folderElement]['childIds'])
					    				{
							    			taskbody += module.exports.getMilestones(moment, $foldersData, $tasksData, $contactsData, $foldersData[folderElement]['childIds'][subfolderIndex], $foldersData[folderElement]['title'], $foldersData[folderElement]['project']['authorId']);
							    		}
						    		}
					    		}
					    	}
					    }
					}
				}
			}
			//console.log(taskbody);

			responsetable = taskshead+taskbody;
			resolve(responsetable)
		});
    },


    buildMilestonesEmailTable: function(moment, $foldersData, $tasksData, $contactsData, $folderID=null){

    	return new Promise(function (resolve, reject) {
	    	taskbody = ''
	    	for(var folderElement in $foldersData){
				if($foldersData[folderElement]['project']){
					if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
						if($foldersData[folderElement]['project']['endDate']){					
					    	if($folderID == null){
					    		//console.log("Line 315", $foldersData[folderElement]['id']);
					    		if($foldersData[folderElement]['childIds'].length > 0){
				    				for(var subfolderIndex in $foldersData[folderElement]['childIds'])
				    				{
						    			taskbody += module.exports.getMilestones(moment, $foldersData,  $tasksData, $contactsData, $foldersData[folderElement]['childIds'][subfolderIndex], $foldersData[folderElement]['title'], $foldersData[folderElement]['project']['authorId']);
						    			
						    		}
					    		}
					    	}else{
					    		if($folderId == $foldersData[folderElement]['_id']){
					    			if($foldersData[folderElement]['childIds'].length > 0){
					    				for(var subfolderIndex in $foldersData[folderElement]['childIds'])
					    				{
							    			taskbody += module.exports.getMilestones(moment, $foldersData, $tasksData, $contactsData, $foldersData[folderElement]['childIds'][subfolderIndex], $foldersData[folderElement]['title'], $foldersData[folderElement]['project']['authorId']);
							    		}
						    		}
					    		}
					    	}
					    }
					}
				}
			}
			//console.log(taskbody);
			responsetable = taskbody;
			resolve(responsetable)
		});
    },

    getDashboardfolderTasks :function(moment, $foldersData,  $tasksData, $contactsData){
		tasks = ''
		hastasks = false;
		taskshead = '<thead>\
				<tr>\
	              <th style="width: 30%;">Critical Dates</th>'
	    taskbody = '<tbody>'
	    tasksArr = {}
		for(var folderElement in $foldersData){
			if($foldersData[folderElement]['project']){
				if($foldersData[folderElement]['project']['endDate']){

    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm');
    				//!dueDate.isAfter( moment()) &&
    				if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm');
    					var daysLeft = dueDate.diff(moment(), 'days');

    					$folderId = $foldersData[folderElement]['_id']
    					//$foldersbreak = false;
    					for(var taskindex in $tasksData){
    						var index = 0;
				    		if($tasksData[taskindex]['parentIds'].length>0){
				    			if($tasksData[taskindex]['parentIds'].indexOf($folderId) > -1){
				    				var dueDate = moment($tasksData[taskindex]['dates']['due'],'YYYY-MM-DDTHH:mm');
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
							var startDate = moment(tasksArr[element][$i]['dates']['start'],'YYYY-MM-DDTHH:mm');
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
		  for(var contactsElement in contactsData['data']){
		    contactsHTML += "<div class='col-md-4 col-sm-4 col-xs-12 profile_details'>"
		    contactsHTML += '<div class="well profile_view" style="display:block !important;overflow:auto">'
		    contactsHTML += "<div class='col-sm-12'>"
		    contactsHTML += '<h4 class="brief"><i>'+contactsData['data'][contactsElement]['title']+'</i></h4>'
		    contactsHTML += '<div class="left col-xs-7">'
		    contactsHTML += '<h2>'+contactsData['data'][contactsElement]['firstName']+" "+contactsData['data'][contactsElement]['lastName']+'</h2>'
		    contactsHTML += ' <ul class="list-unstyled">'
		    contactsHTML += '    <li><i class="fa fa-mail"></i> Email: '+contactsData['data'][contactsElement]['profiles'][0]['email']+' </li>'
		    if(contactsData['data'][contactsElement]['phone']){
		      contactsHTML += '    <li><i class="fa fa-phone"></i> Phone #: '+contactsData['data'][contactsElement]['phone']+'</li>'
		    }
		    contactsHTML += ' </ul>'
		    contactsHTML += '</div>'
		    contactsHTML += ' <div class="right col-xs-5 text-center">'
		    contactsHTML += '     <img src="'+contactsData['data'][contactsElement]['avatarUrl']+'" alt="" class="img-circle img-responsive">'
		    contactsHTML += ' </div>'
		    //contactsHTML += "<img src='"+contactsData['data'][contactsElement]['avatarUrl']+"' ></strong></div>"
		    //contactsHTML += "<div class='col-md-8'><div><strong> Account: "+contactsData['data'][contactsElement]['firstName']+" "+contactsData['data'][contactsElement]['lastName']+"</strong></div>"
		    //contactsHTML += "<div>Accounts: "+contactsData['data'][contactsElement]['title']+"</strong></div>"
		    //contactsHTML += "<div>Accounts: "+contactsData['data'][contactsElement]['profiles'][0]['email']+"</strong></div>"
		    contactsHTML += "</div></div></div>"
		    //contactsHTML += "<div class='clearfix'>&nbsp</div>"
		  }
		  resolve(contactsHTML);
	   });
    },

    folderDashboardContent: function(moment, $foldersData, $tasksData, $contactsData){
    	return new Promise(function (resolve, reject) {
    		//console.log("line 385", typeof($tasksData))
    		var now = moment();
			  var monthsLists = []
			  var activetaskList = []
			  var completedtaskList = []
			  var upcomingTaskList = []
			  var thisWeekTasks = []
			  var todaysTasks = []
			  var overdueTasks = []
			  var A_WEEK_OLD = now.clone().subtract(7, 'days').startOf('day');
			  var ONE_DAY_OLD = now.clone().subtract(1, 'days').startOf('day');

    		var folderDashboardleftMenuHTML = ''
    		var folderDashboardRightShortcutHTML = ''
    		var foldersweeklyCriticalDatesHTML = '';
    		var upcomingTaskHTML = ''
    		var isupcomingTask = false;
    		
    		foldersDashboard = [];
    		 var taskTypes = {'Backlog':0, 'Milestone':0, 'Planned':0}

    		$totalElement = 0;
    		for($i=0; $i<6;$i++){
    			if($i==0){
    				monthsLists[0] = now.format('MMM YYYY');
    			}else{
    				monthsLists[$i] = now.subtract(1, 'months').format('MMM YYYY');
    			}
    			$rtl = 0;
    			for(var Element in $tasksData){
    				$totalElement++;
    				var d = moment($tasksData[Element]['createdDate'],'YYYY-MM-DDTHH:mm');
    				if(monthsLists[$i] == d.format('MMM YYYY')){
    					if($tasksData[Element]['status']=="Completed"){
    						completedtaskList.push($tasksData[Element])
    					}
    					if($tasksData[Element]['status']=="Active"){
    						activetaskList.push($tasksData[Element])
    					}
    				}

    				var month = d.format('M');
    				var year = d.format('YYYY');
    				var lastmonth = d.clone().subtract(1, 'months').format('MMM YYYY');

    				if (d.isAfter(A_WEEK_OLD)){
    					thisWeekTasks.push($tasksData[Element])
    				}

    				if (d.isAfter(ONE_DAY_OLD)){
    					todaysTasks.push($tasksData[Element])
    				}

    				if($tasksData[Element]['dates']['type']=="Backlog"){
    					taskTypes['Backlog'] = taskTypes['Backlog']+1;
    				}
    				if($tasksData[Element]['dates']['type']=="Milestone"){
    					taskTypes['Milestone'] = taskTypes['Milestone']+1;
    				} 
    				if($tasksData[Element]['dates']['type']=="Planned"){
    					taskTypes['Planned'] = taskTypes['Planned']+1;
    					var dueDate = moment($tasksData[Element]['dates']['due'],'YYYY-MM-DDTHH:mm');
    					if(!dueDate.isAfter( moment()) && $tasksData[Element]['status']=="Active"){
				              //console.log("Risk Task FOund.", tasksData['data'][Element] )
				              overdueTasks.push($tasksData[Element])
				          }
				      }
				  }
				}

				monthsLists.reverse()
				activetaskList.reverse()
				completedtaskList.reverse()
				overdueTasks.reverse()

				 completedTasksHTML = '<thead><tr><th>Tasks</th><th>Author</th><th>Status</th></tr></thead></tbody>'
			      $completedTasks = 0;

			      for(var item in completedtaskList){
			        $completedTasks++;
			        //var taskfolder = module.exports.getTaskFolder($tasksData, $foldersData, completedtaskList[item]['id']);
			        completedTasksHTML += '<tr>'
			        //completedTasksHTML += '<td>'+taskfolder+'</td>'
			        completedTasksHTML += '<td><a href="/task/?id='+completedtaskList[item]['_id']+'">'+completedtaskList[item]['title']+'</a></td>';
			        var contact = module.exports.getContactByID($contactsData, completedtaskList[item]['authorIds'])
			         completedTasksHTML += '<td>';
			        if (contact != false){
			          completedTasksHTML += contact['firstName']+' '+contact['lastName'];
			        }
			        completedTasksHTML += '</td>';
			        completedTasksHTML += '<td>'+completedtaskList[item]['status']+'</td>'
			        completedTasksHTML += '</tr>'
			      }
			      completedTasksHTML += '</tbody>'
				      
		       overdueTasksHTML = '<thead><tr><th>Tasks</th><th>Author</th><th>Status</th></tr></thead></tbody>'
		      $totalOverdueTasks = 0;
		      for(var item in overdueTasks){
		        $totalOverdueTasks++;
		        overdueTasksHTML += '<tr>'
		        overdueTasksHTML += '<td style="color:red">'+overdueTasks[item]['title']+'</td>';
		        var contact = module.exports.getContactByID($contactsData, overdueTasks[item]['authorIds'])
		        overdueTasksHTML += '<td>';
		        if (contact != false){
		          overdueTasksHTML += contact['firstName']+' '+contact['lastName'];
		        }
		        overdueTasksHTML += '</td>';
		        overdueTasksHTML += '<td>'+overdueTasks[item]['status']+'</td>'
		        overdueTasksHTML += '</tr>'
		      }
		      overdueTasksHTML += '</tbody>'
		      overdueTasksHTML += '<p> Total Overdue Tasks:'+$totalOverdueTasks+'</p>'


    		for(var folderElement in $foldersData){
    			if($foldersData[folderElement]['project']){
    				if($foldersData[folderElement]['project']['endDate']){

	    				var dueDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm');
	    				//dueDate.isAfter( moment()) &&
	    				if(($foldersData[folderElement]['project']['status']=="Green") && ($foldersData[folderElement]['scope']=="WsFolder")){
	    					if(foldersDashboard.indexOf($foldersData[folderElement]['_id']) == -1){
	    						foldersDashboard.push($foldersData[folderElement]['_id']);	    					
		    					var startDate = moment($foldersData[folderElement]['project']['startDate'],'YYYY-MM-DDTHH:mm');
		    					var endDate = moment($foldersData[folderElement]['project']['endDate'],'YYYY-MM-DDTHH:mm');
		    					var daysLeft = dueDate.diff(moment(), 'days');
		    					if (daysLeft<0){
		    						daysLeftText = "overdue "+daysLeft+" days"
		    					}else{
		    						daysLeftText = daysLeft
		    					}
			    				folderDashboardleftMenuHTML += '<div class="x_panel widget">\
						          <div class="x_title" style="  ">\
						          <ul class="nav navbar-right panel_toolbox" style="margin-right:-7px; */  min-width: 50px;">\
						          <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>\
						          </li>\
						          <li><a class="close-link"><i class="fa fa-close"></i></a>\
						          </li>\
						          </ul>\
						          <div class="title_tast">\
						          	<a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
						          </div>\
						          <div class="clearfix"></div>\
						          </div>\
						          <div class="x_content">\
						          <div style="text-align:right">\
						          <p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px;">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Opening Date:  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+startDate.format("DD MMM YYYY")+'</button></span>\
						          <div class="clearfix"></div>\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Launch :  </span>\
						          <span style="float:right"><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+endDate.format("DD MMM YYYY")+'</button></span>\
						          <div class="clearfix"></div>\
						          </p>\
						          <p style="text-align:center">\
						          <span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						          <span style=" font-size: 18px; color: darkred">'+daysLeftText+'</span>\
						          </p>\
						          </div>\
						          </div>\
						          </div>';	

						          folderDashboardRightShortcutHTML += '<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
								                                    <span><span class="fa fa-file-o"></span></span>\
								                                    <span style="padding-left: 5px;  font-size: 14px; color:#696565;">\
								                                    <a href="/folders/?id='+$foldersData[folderElement]['_id']+'">'+$foldersData[folderElement]['title']+'</a>\
								                                    </span>\
								                                  </p>'
							}
				          }	

				      }
    			}    			
    		}	


    		for(var taskindex in $tasksData){
				var startDate = moment($tasksData[taskindex]['dates']['start'],'YYYY-MM-DDTHH:mm');
				//
    			if( (startDate.isAfter(moment()) && startDate.diff(moment(), 'days') <= 40)){
    				isupcomingTask = true;
    				upcomingTaskHTML += '<tr>\
		                                    <td style="text-align:center"><span class="fa fa-circle" style="color: Green;    font-size:18px;"></span></td>\
		                                    <td>'+$tasksData[taskindex]['title']+'</td>'
		            var contact = module.exports.getContactByID($contactsData, $tasksData[taskindex]['authorIds'])
				  	if (contact != false){
				  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
				  	}
	                var startDate = '-'
				  	var endDate = '-'
				  	if($tasksData[taskindex]['dates']['start']){
				  		var startDateObj = moment($tasksData[taskindex]['dates']['start'],'YYYY-MM-DDTHH:mm');
						startDate = startDateObj.format('DD MMM YYYY');
				  	}
				  	if($tasksData[taskindex]['dates']['due']){
				  		var endDateObj = moment($tasksData[taskindex]['dates']['due'],'YYYY-MM-DDTHH:mm');
						endDate = endDateObj.format('DD MMM YYYY');
				  	}
		                upcomingTaskHTML += '<td>'+startDate+'</td>\
		                					<td>'+endDate+'</td>\
		                                  </tr>';
    			}
			}

    		foldersweeklyCriticalDatesHTML += module.exports.getDashboardfolderTasks(moment, $foldersData,  $tasksData, $contactsData);

    		returnResponse = {
    			'folderDashboardleftMenuHTML': folderDashboardleftMenuHTML,
    			'foldersweeklyCriticalDatesHTML': JSON.parse(foldersweeklyCriticalDatesHTML),
    			'folderDashboardRightShortcutHTML': folderDashboardRightShortcutHTML,
    			'completedTasksHTML': completedTasksHTML,
    			'overdueTasksHTML': overdueTasksHTML,
    			'upcomingTaskHTML' : upcomingTaskHTML,
    			'isupcomingTask': isupcomingTask
    		}
    		//console.log(util.inspect(JSON.parse(foldersweeklyCriticalDatesHTML), false, null))
    		resolve(returnResponse)    	
        });
    },

    taskGanntChart: function(moment, $tasksData, folderId=null, $contactsData=null, $foldersData=null){
    	return new Promise(function (resolve, reject) {
	    	var tasks = []
	    	if(folderId==null){
	    		//_taskData = $tasksData;
	    		_taskData = [];	
	    		
				foldersListHtmlArr = module.exports.getallTasks(moment, $tasksData, $contactsData)
				console.log("Line 403",foldersListHtmlArr['tasksArr'])
				 for(var index in foldersListHtmlArr['tasksArr']){
				 	_taskData.push(foldersListHtmlArr['tasksArr'][index])
				 }			
			    	
	    	}else{
	    		//console.log("Line 398 =========================")
	    		_taskData = [];	
	    		for(var foldersElement in $foldersData){
	    			if(folderId == $foldersData[foldersElement]['_id']){
		    			//console.log("Line 400 =========================")
		    			// if($foldersData[foldersElement]['childIds'].length > 0){
		    			// 	for(var subfolderIndex in $foldersData[foldersElement]['childIds'])
		    			// 	{
		    					foldersListHtmlArr = module.exports.getfolderTasks(moment, $tasksData, $contactsData, $foldersData[foldersElement]['_id'])
		    					console.log("Line 403",foldersListHtmlArr)
		    					 for(var index in foldersListHtmlArr['tasksArr']){
		    					 	_taskData.push(foldersListHtmlArr['tasksArr'][index])
		    					 }			
		    			// 	}
		    			// }
		    		}
	    		}
	    	}
	    	//console.log("922", '-------------------', _taskData)
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
	    		if(__thistaskData['dates']['type']=="Planned"){
		    		var startDate = moment(__thistaskData['dates']['start'],'YYYY-MM-DDTHH:mm');
		    		var dueDate = moment(__thistaskData['dates']['due'],'YYYY-MM-DDTHH:mm');
		    		var task = {
		    			 id: __thistaskData['_id'],
					    name: __thistaskData['title'],
					    start: startDate.format('YYYY-MM-DD'),
					    end: dueDate.format('YYYY-MM-DD'),
					    progress: 100
		    		}	
		    		if(__thistaskData['subTaskIds']){
			    		if(__thistaskData['subTaskIds'].length > 0){
			    			task['dependencies'] = dependencies
			    		}
			    	}
	    		    		
		    		tasks.push(task)
		    	}
	    	}
	    	//console.log("960", '-------------------', _taskData)

	    	tasks.sort(function(a,b){
				  var c = new Date(a.start);
				  var d = new Date(b.start);
				  return c-d;
				});
	    	
	    	resolve(tasks)
	    })
    },

    tasksEmailContent: function(moment, $folders, $tasks, $contacts){
    	return new Promise(function (resolve, reject) {

    		// initalise variables
		  var tasksData = $tasks
		  var contactsData = $contacts

		  var now = moment();
		  var monthsLists = []
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
    		for($i=0; $i<6;$i++){
    			if($i==0){
    				monthsLists[0] = now.format('MMM YYYY');
    			}else{
    				monthsLists[$i] = now.subtract(1, 'months').format('MMM YYYY');
    			}
    			$rtl = 0;
    			for(var Element in tasksData['data']){
    				$totalElement++;
    				var d = moment(tasksData['data'][Element]['createdDate'],'YYYY-MM-DDTHH:mm');
    				if(monthsLists[$i] == d.format('MMM YYYY')){
    					if(tasksData['data'][Element]['status']=="Completed"){
    						completedtaskList.push(tasksData['data'][Element])
    					}
    					if(tasksData['data'][Element]['status']=="Active"){
    						activetaskList.push(tasksData['data'][Element])
    					}
    				}

    				var month = d.format('M');
    				var year = d.format('YYYY');
    				var lastmonth = d.clone().subtract(1, 'months').format('MMM YYYY');

    				if (d.isAfter(A_WEEK_OLD)){
    					thisWeekTasks.push(tasksData['data'][Element])
    				}

    				if (d.isAfter(ONE_DAY_OLD)){
    					todaysTasks.push(tasksData['data'][Element])
    				}

    				if(tasksData['data'][Element]['dates']['type']=="Backlog"){
    					taskTypes['Backlog'] = taskTypes['Backlog']+1;
    				}
    				if(tasksData['data'][Element]['dates']['type']=="Milestone"){
    					taskTypes['Milestone'] = taskTypes['Milestone']+1;
    				} 
    				if(tasksData['data'][Element]['dates']['type']=="Planned"){
    					taskTypes['Planned'] = taskTypes['Planned']+1;
    					var dueDate = moment(tasksData['data'][Element]['dates']['due'],'YYYY-MM-DDTHH:mm');
    					if(!dueDate.isAfter( moment()) && tasksData['data'][Element]['status']=="Active"){
				              //console.log("Risk Task FOund.", tasksData['data'][Element] )
				              overdueTasks.push(tasksData['data'][Element])
				          }
				      }
				  }
				}


				// for(var taskindex in tasksData['data']){
				// 	var startDate = moment($tasksData[taskindex]['dates']['start'],'YYYY-MM-DDTHH:mm');
    //     			if(startDate.isAfter(moment()) && (startDate.diff(moment(), 'days') <= 7) && $tasksData[taskindex]['status']=="Active"){

    //     			}
				// }


				monthsLists.reverse()
				activetaskList.reverse()
				completedtaskList.reverse()
				overdueTasks.reverse()

				activetaskListHTML = ''
				$breakActivehtml = 0
				for(var item in activetaskList){

					if(activetaskList[item]['dates']['start']){
						var startDate = moment(activetaskList[item]['dates']['start'],'YYYY-MM-DDTHH:mm');

						activetaskListHTML += '<div class="x_panel widget">\
						<div class="x_title" style="  ">\
						<ul class="nav navbar-right panel_toolbox" style="margin-right:-7px; */  min-width: 50px;">\
						<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>\
						</li>\
						<li><a class="close-link"><i class="fa fa-close"></i></a>\
						</li>\
						</ul>\
						<div class="title_tast"><a href="/task/?id='+activetaskList[item]['_id']+'">'+activetaskList[item]['title']+'</a></div>\
						<div class="clearfix"></div>\
						</div>\
						<div class="x_content">\
						<div >\
						<p style=" border-bottom: 1px solid #ECECEC; padding-bottom: 10px">\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Opening Date:  </span>\
						<span><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-calendar"></span>'+startDate.format("DD MMM, YYYY")+'</button></span>\
						</p>\
						<p>\
						<span style="padding-right: 5px;  font-size: 14px; color:#696565; font-weight: bold">Days Left:  </span>\
						<span style=" font-size: 18px; color: darkred">66</span>\
						</p>\
						</div>\
						</div>\
						</div>';

		          //$("#tasks-left-panel").append(activetaskListHTML);
		          $breakActivehtml++;
		          if($breakActivehtml > 10){
		          	break;
		          }
		      }
		  }


		  completedTasksHTML = '';
		  $completedTasks = 0;

		  $i =0;
		  for(var item in completedtaskList){
		  	$i++;
		  	if($i>15){
		  		break;
		  	}
		  	$completedTasks++;
		  	completedTasksHTML += '<tr>'
		  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px"><a href="/task/?id='+completedtaskList[item]['_id']+'">'+completedtaskList[item]['title']+'</a></td>';
		  	var contact = module.exports.getContactByID(contactsData, completedtaskList[item]['authorIds'])
		  	if (contact != false){
		  		completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
		  	}
		  	completedTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+completedtaskList[item]['status']+'</td>'
		  	completedTasksHTML += '</tr>'

		  }
		  completedTasksHTML += ''
			      //completedTasksHTML += '<p> Completed Tasks:'+$completedTasks+'</p>'
			      ////document.getElementById('completedTaskstable').innerHTML = completedTasksHTML
			      //document.getElementById('completedTasksTotal').innerHTML = 'Total:'+$completedTasks


			      overdueTasksHTML = ''
			      $totalOverdueTasks = 0;
			      $j=0;
			      for(var item in overdueTasks){
			      	$j++;
			      	if($j>15){
			      		break;
			      	}
			      	$totalOverdueTasks++;
			      	overdueTasksHTML += '<tr>'
			      	overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+overdueTasks[item]['title']+'</td>';
			      	var contact = module.exports.getContactByID(contactsData, overdueTasks[item]['authorIds'])
			      	if (contact != false){
			      		overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
			      	}
			      	overdueTasksHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+overdueTasks[item]['status']+'</td>'
			      	overdueTasksHTML += '</tr>'
			      }

			      overdueTasksHTML += ''
			      //overdueTasksHTML += '<p> Total Overdue Tasks:'+$totalOverdueTasks+'</p>'
			      //document.getElementById('overdueTaskstable').innerHTML += overdueTasksHTML

			       $k=0;
			       upcomingTaskHTML = ''
			      for(var taskindex in tasksData['data']){
						var startDate = moment(tasksData['data'][taskindex]['dates']['start'],'YYYY-MM-DDTHH:mm');
						//
		    			if( (startDate.isAfter(moment()) && startDate.diff(moment(), 'days') <= 40) && tasksData['data'][taskindex]['status']=="Active"){
		    				$k++;
					      	if($k>15){
					      		break;
					      	}
		    				isupcomingTask = true;
		    				upcomingTaskHTML += '<tr>\
				                                    <td>'+tasksData['data'][taskindex]['title']+'</td>'
				            var contact = module.exports.getContactByID(contactsData, tasksData['data'][taskindex]['authorIds'])
						  	if (contact != false){
						  		upcomingTaskHTML += '<td bgcolor="#FFFFFF" style="font-family:Helvetica,Arial,sans-serif;font-size:14px">'+contact['firstName']+' '+contact['lastName']+'</td>'
						  	}
						  	var startDate = '-'
						  	var endDate = '-'
						  	if(tasksData['data'][taskindex]['dates']['start']){
						  		var startDateObj = moment(tasksData['data'][taskindex]['dates']['start'],'YYYY-MM-DDTHH:mm');
								startDate = startDateObj.format('DD MMM YYYY');
						  	}
						  	if(tasksData['data'][taskindex]['dates']['due']){
						  		var endDateObj = moment(tasksData['data'][taskindex]['dates']['due'],'YYYY-MM-DDTHH:mm');
								endDate = endDateObj.format('DD MMM YYYY');
						  	}
				                upcomingTaskHTML += '<td>'+startDate+'</td>\
				                					<td>'+endDate+'</td>\
				                                  </tr>';
						  	}
		    			}
					

			      var returnData = {
			      	'completedtaskHTML': completedTasksHTML,
			      	'overdueTasksHTML': overdueTasksHTML,
			      	'upcomingTaskHTML': upcomingTaskHTML
			      }
			      resolve(returnData)

			  });

	}
}
