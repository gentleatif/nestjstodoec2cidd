# Todo API – cURL / Postman

Base URL: `http://localhost:3000` (or your `PORT`)

---

## 1. Create a todo (POST)

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"My first todo","description":"Optional description","completed":false}'
```

Minimal (title only):

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'
```

---

## 2. Get all todos (GET)

```bash
curl -X GET http://localhost:3000/todos
```

---

## 3. Get one todo by id (GET)

Replace `:id` with the actual `id` from the create response (e.g. `1739787384123-abc123xyz`).

```bash
curl -X GET http://localhost:3000/todos/:id
```

Example:

```bash
curl -X GET http://localhost:3000/todos/1739787384123-abc123xyz
```

---

## 4. Update a todo (PATCH)

Replace `:id` with the todo id. You can send only the fields you want to change.

```bash
curl -X PATCH http://localhost:3000/todos/:id \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","completed":true}'
```

Example – mark as completed:

```bash
curl -X PATCH http://localhost:3000/todos/1739787384123-abc123xyz \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

---

## 5. Delete a todo (DELETE)

Replace `:id` with the todo id.

```bash
curl -X DELETE http://localhost:3000/todos/:id
```

Example:

```bash
curl -X DELETE http://localhost:3000/todos/1739787384123-abc123xyz
```

---

## Postman

- **Method** and **URL**: use the same method and URL as in the cURL (e.g. `POST http://localhost:3000/todos`).
- **Body**: for POST and PATCH choose **raw** → **JSON** and use the same JSON as in the `-d '...'` part of the cURL.
- **Headers**: set `Content-Type: application/json` for POST and PATCH (Postman often does this when you pick JSON body).

Data is stored in memory only; restarting the server clears all todos.
