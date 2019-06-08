//Declaring the variables & copying the firebase config to the top of the page


var firebaseConfig = {
  apiKey: "AIzaSyAIMUQ_Vdt4CqXF780w5Jdtb6ulo6BrvqQ",
  authDomain: "fir-train-app.firebaseapp.com",
  databaseURL: "https://fir-train-app.firebaseio.com",
  projectId: "fir-train-app",
  storageBucket: "fir-train-app.appspot.com",
  messagingSenderId: "285929271414",
  appId: "1:285929271414:web:4f54d55ce0595caf"
     
 };

//Initializing firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var trainName = "";
var destination = "";
var startTime = "";
var frequency = 0;

//The current time to reference 
function currentTime() {
  var current = moment().format('LT');
  $("#currentTime").html(current);
  setTimeout(currentTime, 1000);
};

//Inserting then storing data
$(".form-field").on("keyup", function() {
  var traintemp = $("#train-name").val().trim();
  var destinationtemp = $("#destination").val().trim();
  var timetemp = $("#first-train").val().trim();
  var frequencytemp = $("#frequency").val().trim();

  console.log(traintemp);
  console.log(destinationtemp)
  console.log(timetemp)
  console.log(frequencytemp)

  
  sessionStorage.setItem("train", traintemp);
  sessionStorage.setItem("destination", destinationtemp);
  sessionStorage.setItem("time", timetemp);
  sessionStorage.setItem("frequency", frequencytemp);

  });

$("#train-name").val(sessionStorage.getItem("train"));
$("#destination").val(sessionStorage.getItem("destination"));
$("#first-train").val(sessionStorage.getItem("time"));
$("#frequency").val(sessionStorage.getItem("frequency"));

//To submit data and prevent errors
$("#submit").on("click", function(event) {
  event.preventDefault();

  if ($("#train-name").val().trim() === "" ||
    $("#destination").val().trim() === "" ||
    $("#first-train").val().trim() === "" ||
    $("#frequency").val().trim() === "") {

    alert("Please completely fill in all blank areas to add new train");

  } else {

    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    startTime = $("#first-train").val().trim();
    frequency = $("#frequency").val().trim();

    $(".form-field").val("");

    //to push data to firebase
    database.ref().push({
      trainName: trainName,
      destination: destination,
      frequency: frequency,
      startTime: startTime,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

  
  }

 

});

sessionStorage.clear();

database.ref().on("child_added", function(childSnapshot) {
  var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
  var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
  var timeRemain = timeDiff % childSnapshot.val().frequency;
  var minToArrival = childSnapshot.val().frequency - timeRemain;
  var nextTrain = moment().add(minToArrival, "minutes");
  var key = childSnapshot.key;

  var newrow = $("<tr>");
  newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
  newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
  newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
  newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
  newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
  newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));

  if (minToArrival < 6) {
    newrow.addClass("info");
  }

  $("#train-table-rows").append(newrow);
});

$(document).on("click", ".arrival", function() {
  keyref = $(this).attr("data-key");
  database.ref().child(keyref).remove();
  window.location.reload();
});

currentTime();

setInterval(function() {
  window.location.reload();
}, 60000);
