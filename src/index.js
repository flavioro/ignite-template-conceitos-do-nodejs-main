const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  )

  if (!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.find(
    (user) => user.username === username
  )

  if (user) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const userNew = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(userNew)

  return response.status(201).send(userNew)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  // console.log(response.user)

  request.user.todos.push(todo)

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params;
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  // console.log(todo)

  if (!todo) {
    return response.status(404).json({ error: "Id to do not Exists!" })
  }

  todo.title = title
  todo.deadline = deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Id to do not Exists!" })
  }

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Id to do not Exists!" })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;