const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')


morgan.token('body', function(request, response){
  return JSON.stringify(request.body);
 });

morgan.format('tinymore', ':method :url :status :res[content-length] - :response-time ms :body') 

app.use(cors())
app.use(express.json())
app.use(morgan('tinymore'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  let date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people<br/>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  let max = 1000000
  const randomId = Math.floor(Math.random() * max)
  return randomId
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  // console.log('body:', body)
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if(persons.find(person=>person.name===body.name)){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
    // date: new Date(),  
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})