$(document).ready(function () {
  // Getting a reference to the input field where user adds a new burger
  var $newItemInput = $("input.new-item");
  // Our new burgers will go inside the burgerContainer
  var $burgerContainer = $(".burger-container");

  var $burgersDevouredContainer = $(".burgers-devoured-container");

  // Adding event listeners for editing, adding, and devouring burgers
  $(document).on("click", "button.complete", toggleComplete);
  $(document).on("click", ".burger", editBurger);
  $(document).on("keyup", ".burger", finishEdit);
  $(document).on("blur", ".burger", cancelEdit);
  $(document).on("submit", "#burger-form", insertBurger);

  // Our initial burgers array
  var burgers = [];

  // Getting burgers from database when page loads
  getBurgers();

  // This function resets the burgers displayed with new burgers from the database
  function initializeRows() {
    $burgerContainer.empty();
    $burgersDevouredContainer.empty();
    var rowsToAdd = [];
    var devouredRowsToAdd = [];
    for (var i = 0; i < burgers.length; i++) {
      if (burgers[i].devoured) {
        var newInputRow = createNewRow(burgers[i]);
        newInputRow.find("span").css('color', 'red');
        devouredRowsToAdd.push(newInputRow);
      }
      else {
        rowsToAdd.push(createNewRow(burgers[i]));
      }
    }
    $burgerContainer.prepend(rowsToAdd);
    $burgersDevouredContainer.prepend(devouredRowsToAdd);
  }

  // This function grabs burgers from the database and updates the view
  function getBurgers() {
    $.get("/api/burgers", function (data) {
      burgers = data;
      initializeRows();
    });
  }

  // This function handles showing the input box for a user to edit a burger
  function editBurger() {
    var currentBurger = $(this).data("burger");
    $(this).children().hide();
    $(this).children("input.edit").val(currentBurger.burger_name);
    $(this).children("input.edit").show();
    $(this).children("input.edit").focus();
  }

  // Toggles complete status
  function toggleComplete(event) {
    event.stopPropagation();
    console.log(this);
    var burger = $(this).parent().data("burger");
    burger.devoured = !burger.devoured;
    updateBurger(burger);
  }

  // This function starts updating a burger in the database if a user hits the "Enter Key"
  // While in edit mode
  function finishEdit(event) {
    var updatedBurger = $(this).data("burger");
    if (event.which === 13) {
      updatedBurger.burger_name = $(this).children("input").val().trim();
      $(this).blur();
      updateBurger(updatedBurger);
    }
  }

  // This function updates a burger in our database
  function updateBurger(burger) {
    $.ajax({
      method: "PUT",
      url: "/api/burgers",
      data: burger
    }).then(getBurgers);
  }

  // This function is called whenever a burger item is in edit mode and loses focus
  // This cancels any edits being made
  function cancelEdit() {
    var currentBurger = $(this).data("burger");
    if (currentBurger) {
      $(this).children().hide();
      $(this).children("input.edit").val(currentBurger.burger_name);
      $(this).children("span").show();
      $(this).children("button").show();
    }
  }

  // This function constructs a burger-item row
  function createNewRow(burger) {
    var $newInputRow = $(
      [
        "<li class='list-group-item burger'>",
        "<span class='burger-name'>",
        burger.burger_name,
        "</span>",
        "<input type='text' class='edit'>",
        "<button class='complete btn btn-primary'>Devour</button>",
        "</li>"
      ].join("")
    );

    if (burger.devoured) {
      $newInputRow.find("button").hide();
    } 

    $newInputRow.find("input.edit").css("display", "none");
    $newInputRow.data("burger", burger);
    return $newInputRow;
  }

  // This function inserts a new burger into our database and then updates the view
  function insertBurger(event) {
    event.preventDefault();
    var burger = {
      burger_name: $newItemInput.val().trim(),
      devoured: false
    };

    $.post("/api/burgers", burger, getBurgers);
    $newItemInput.val("");
  }
});
