const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userByUsername = users.find((user) => user.username === username);

  if (!userByUsername)
    return response.status(404).json({ error: "User not found" });

  request.user = userByUsername;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (usernameAlreadyExists)
    return response.status(400).json({ error: "Username already exists" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodoItem = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodoItem);

  return response.status(201).json(newTodoItem);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todoItemById = user.todos.find((todoItem) => todoItem.id === id);

  if (!todoItemById)
    return response.status(404).json({ error: "Todo item not found" });

  todoItemById.title = title;
  todoItemById.deadline = deadline;

  return response.json(todoItemById);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoItemById = user.todos.find((todoItem) => todoItem.id === id);

  if (!todoItemById)
    return response.status(404).json({ error: "Todo item not found" });

  todoItemById.done = true;

  return response.status(200).json(todoItemById);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoItemById = user.todos.find((todoItem) => todoItem.id === id);

  if (!todoItemById)
    return response.status(404).json({ error: "Todo item not found" });

  user.todos = user.todos.filter((todoItem) => todoItem.id !== id);

  return response.status(204).send();
});

module.exports = app;
