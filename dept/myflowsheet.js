var UIUCURL = "https://courses.illinois.edu/schedule/terms/DEPARTMENT/COURSE";

function clearTable() {
	jQuery("#flowsheet table .prereq").removeClass("prereq");
	jQuery("#flowsheet table .coreq").removeClass("coreq");
	jQuery("#flowsheet table .postreq").removeClass("postreq");
	jQuery("#flowsheet table .immediate").removeClass("immediate");
}

function determinePostreqs(course_id) {
	objCourse = jQuery("div[data-course-id='" + course_id + "']");
	var course = objCourse.attr("data-id");
	objCourse.attr("data-post", "");
	jQuery("[data-pre~='" + course + "'], [data-co~='" + course + "']").each(function (i, e) {
		var current = objCourse.attr("data-post");
		var newpost = current + " " + jQuery(this).attr("data-id");
		jQuery("div[data-id='" + course + "']").attr("data-post", newpost)
	});
}

function traverseReqs(course, direction, otherclass) {
	var reqstr = jQuery("div[data-id='" + course + "']").attr("data-" + direction);
	var reqarr = new Array();
	
	if(reqstr != null) {
		reqarr = reqstr.split(" ");
		for(var x = 0; x < reqarr.length; x++){
			crs = reqarr[x];
				
			if (otherclass !== undefined) jQuery("div[data-id='" + crs + "']").addClass(otherclass);
				
			if (jQuery("div[data-id='" + crs + "']").hasClass(direction + "req")) {

			}
			else {
				jQuery("div[data-id='" + crs + "']").addClass(direction + "req");
				if (direction == "co") {
					traverseReqs(crs, "pre");
				}
				else {
					traverseReqs(crs, direction);
				}
			}
		}
	}
}

function addCourseTitle(course_id) {
	var myClass = jQuery("div[data-course-id='" + course_id + "']");
	var course = myClass.attr("data-id");
	var label = myClass.attr('data-label');
	var name = myClass.attr('data-name');
	var desc = myClass.attr('data-content');

	// get link to campus course profile page
	var len = course.length;
	var dept = course.substr(0, len - 3);
	var crs = course.substr(len - 3, 3);
	var location = UIUCURL.replace("DEPARTMENT", dept).replace("COURSE", crs);

	var text = "<div class='rubric'>" + label + "</div><div class='crs_title'><a href='" + location + "' target='_blank'>" + name + "</a></div>";
	text += "<div class='offscreen'>" + desc + "</div>";
	myClass.html(text);
}

function addElectiveTitle(course_id) {
	var myClass = jQuery("div[data-course-id='" + course_id + "']");
	var course = myClass.attr("data-id");
	var name = myClass.attr('data-name');
	var url = myClass.attr('data-url');

	if (url) {
		var text = "<div class='rubric'>" + course +  "</div><div class='crs_title'><a href='" + url + "' target='_blank'>" + name + "</a></div>";
	}
	else {
		var text = "<div class='rubric'>" + course +  "</div><div class='crs_title'>" + name + "</div>";
	}

	myClass.html(text);
}


jQuery(document).ready(function() { 

	jQuery("#courseTable div.course").each(function(){
		course_id = jQuery(this).attr("data-course-id");
		determinePostreqs(course_id);
		addCourseTitle(course_id);
	});
	
	jQuery("#courseTable div.elective").each(function(){
		elective_id = jQuery(this).attr("data-course-id");
		addElectiveTitle(elective_id);
	});

	
	// append footnotes
	jQuery("#notes_container li").each(function(i) {
		// add note id
		jQuery(this).attr("id", "note_" + (i + 1));
		var strTarget = jQuery(this).attr("data-target");
		if (strTarget) {
			var arrTargets = strTarget.split("|");

			arrTargets.forEach(function(val, j) {
				jQuery("#courseTable div[data-id='" + val + "']").each(function(k) {
					if (jQuery(this).find("sup").length == 0) {
						jQuery(this).find(".rubric").append("<sup></sup>");
					}
					var $sup = jQuery(this).find("sup");
					var sup = $sup.html();

					if (sup.length > 0) {
						sup = sup + ", ";
					}
					sup = sup + "<a aria-describedby='notes_label' href='#note_" + (i + 1) + "'>" + (i + 1) + "</a>";
					$sup.html(sup);

				})
			});
		}
	});

	// add note ref id's to all footnote links
	jQuery("#courseTable sup a").each(function(i) {
		jQuery(this).attr("id", "note_ref_" + i);
	});

	// add onclick highlighting and backlink for footnotes
	jQuery("#courseTable sup a").click(function(e) {
		var targetNoteId = jQuery(this).attr("href");
		var noteRefId = "#" + jQuery(this).attr("id");
		jQuery("#notes_container li").removeClass("highlight");
		jQuery(targetNoteId).addClass("highlight");
		jQuery("#notes_container .backlink").remove();
		jQuery(targetNoteId).append(" <a href='" + noteRefId + "' class='backlink' aria-label='Back to content'>â†µ</a></li>");
	});


	// create mouseover event behavior for pre/post-requisite highlighting
	jQuery("#courseTable div").mouseover(function (e) {
		var course = jQuery(this).attr("data-id");
		if (course != undefined) {
			var content = jQuery(this).attr("data-content");
			jQuery("#coursecontent").html(content);
			traverseReqs(course, "pre", "immediate");
			traverseReqs(course, "post");
			traverseReqs(course, "co");
		}
		else {
			jQuery("#coursecontent").html("");
		}

	}).mouseout(clearTable);


});
	