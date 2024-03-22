// Retrieve tasks and nextId from localStorage or initialize empty array and default ID value
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Function to generate a unique task ID and update nextId in localStorage
function generateTaskId() {
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return nextId++;
}

// Function to create a task card based on task data
// Function to create a task card element with given properties
function createTaskCard({ id, title, description, dueDate, status }) {
  // Create a div element for the task card, add necessary classes and set its data-task-id attribute
  const taskCard = $('<div>').addClass('card w-75 task-card draggable my-3').attr('data-task-id', id);
  const cardHeader = $('<div>').addClass('card-header h4').text(title);
  const cardBody = $('<div>').addClass('card-body');
  const cardText = $('<p>').addClass('card-text').text(description + ' - ' + dueDate);
  const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', id);

  cardDeleteBtn.on('click', handleDeleteTask);

  // Set card background color based on due date and status
  const now = dayjs(); // Get the current date
  const doneDate = dayjs(dueDate); // Convert the due date to a dayjs object
  const warningDate = dayjs(dueDate).subtract(3, 'day'); // Calculate a warning date 3 days before the due date

  // If the current date is after the warning date and the status is not 'done', add warning styling to the task card
  if (now.isAfter(warningDate) && status != 'done') {
    taskCard.addClass('bg-warning text-white');
  }

  // If the current date is after the due date and the status is not 'done', add overdue styling to the task card
  if (now.isAfter(doneDate) && status != 'done') {
    taskCard.addClass('bg-danger text-white ');
    cardDeleteBtn.addClass('border-light'); // Add a light border to the delete button for visibility
  }

  // Append card elements to build the task card
  cardBody.append(cardText, cardDeleteBtn); // Append card text and delete button to the card body
  taskCard.append(cardHeader, cardBody); // Append card header and body to the task card

  return taskCard; // Return the completed task card element
}


// Function to render task lists in different status lanes
function renderTaskList() {
  const todoList = $('#todo-cards');
  const inProgressList = $('#in-progress-cards');
  const doneList = $('#done-cards');

  // Empty existing task cards
  todoList.empty();
  inProgressList.empty();
  doneList.empty();

  // Loop through tasks and create task cards for each status
  for (let task of taskList) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  // Make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable') ? $(e.target) : $(e.target).closest('.ui-draggable');
      return original.clone().css({maxWidth: original.outerWidth()});
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // Create a new task object
  const task = {
    id: generateTaskId(),
    title: $('#title').val(),
    description: $('#taskDescription').val(),
    dueDate: $('#taskDueDate').val(),
    status: 'to-do',
  };

  // Add the new task to the taskList, save to localStorage, and render
  taskList.push(task);
  localStorage.setItem('tasks', JSON.stringify(taskList));

  // Call render function
  renderTaskList();

  // Clear input fields
  $('#title, #taskDescription, #taskDueDate').val('');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  event.preventDefault();
  const taskId = $(this).attr('data-task-id');

  // Remove the task from the taskList, save to localStorage, and render
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr('data-task-id');
  const newStatus = event.target.id;

  // Update the task status of the dragged card, save to localStorage, and render
  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Function to initialize when the document is ready
$(document).ready(function () {
  // Render the task list
  renderTaskList();

  // Add event listener for adding a new task
  $('#taskForm').on('submit', handleAddTask);

  // Make lanes droppable for task cards
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Make due date field a date picker
  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
