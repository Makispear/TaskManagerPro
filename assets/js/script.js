// FOR SAVING TASKS
var tasks = {};

// FOR CREATING NEW TASKS 
var createTask = function(taskText, taskDate, taskList) {
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);
  taskLi.append(taskSpan, taskP);
  auditTask(taskLi)
  $("#list-" + taskList).append(taskLi);
};


//LOADS OLD THINGS WHEN PAGE LOADS
var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }
  $.each(tasks, function(list, arr) {
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

// SAVE TO LOCALSTORAGE
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// WHEN EDITNG THE DESCRIPTION
$(".list-group").on("click", "p", function() {
var text = $(this)
  .text()
  .trim();
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// WHEN LEAVING ALL TEXT AREAS IN CARDS
$(".list-group").on("blur", "textarea", function() {
var text = $(this).val().trim();
var status = $(this).closest(".list-group").attr("id").replace("list-", "");
var index = $(this).closest(".list-group-item").index();
tasks[status][index].text = text;
saveTasks();
var taskP = $("<p>").addClass("m-1").text(text);
$(this).replaceWith(taskP);
});

// DUE DATES CLICKED
$(".list-group").on("click", "span", function() {
  var date = $(this).text().trim();
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  $(this).replaceWith(dateInput);
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      $(this).trigger("change");
    }
  });
  dateInput.trigger("focus");
});

// WHEN DUE DATES CHANGE
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this)
    .val()
    .trim();
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();
  tasks[status][index].date = date;
  saveTasks();
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);
});

// WHEN MODAL WAS TRIGGERED
$("#task-form-modal").on("show.bs.modal", function() {
  $("#modalTaskDescription, #modalDueDate").val("");
});

// WHEN MODAL IS VISIBLE
$("#task-form-modal").on("shown.bs.modal", function() {
  $("#modalTaskDescription").trigger("focus");
});

// WHEN SAVE BTN IN MODAL WAS CLICKED
$("#task-form-modal .btn-primary").click(function() {
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");
    $("#task-form-modal").modal("hide");
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
    saveTasks();
  }
});

// DELETING ALL TASKS
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

//  FOR MAKING LIST SORTABLE
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  update: function(event) {
var tempArr = [];
$(this).children().each(function() {
  var text = $(this).find("p").text().trim();  
  var date = $(this).find("span").text().trim();
  tempArr.push({
    text: text,
    date: date
  });
});
var arrName = $(this).attr("id").replace("list-", "");
tasks[arrName] = tempArr;
saveTasks();
  }
});

// FOR MAKING LIST DROPABLE (delted with a drag feature)
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// FOR PICKING DATES (jQuery UI)
$("#modalDueDate").datepicker({
  minDate: 1
});

//  FOR AUDITING DUE DATES (Moment.js)
var auditTask = function(taskEl) {
  var date = $(taskEl).find("span").text().trim();
  var time = moment(date, "L").set("hour", 17);
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// LOAD TASKS ON PAGE LOAD
loadTasks();


