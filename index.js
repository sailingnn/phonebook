require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function(request, response){
  return JSON.stringify(request.body);
 });

morgan.format('tinymore', ':method :url :status :res[content-length] - :response-time ms :body') 

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tinymore'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  // response.json(persons)
  Person.find({}).then(result => {
    response.json(result)
    // result.forEach(person => {
    //   console.log(`${person.name} ${person.number}`)  
    // })
  })
})

app.get('/info', (request, response) => {
  let date = new Date()
  Person.count({}).then(length=>
    response.send(`<p>Phonebook has info for ${length} people<br/>${date}</p>`)
  )
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)
  // const person = persons.find(person => person.id === id)
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error)) 
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
  let max = 1000000
  const randomId = Math.floor(Math.random() * max)
  return randomId
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log('body:', body)
  // if (!body.number) {
  //   console.log('error: number missing')
  //   return response.status(400).json({ 
  //     error: 'number missing' 
  //   })
  // }

  // if (!body.name) {
  //   return response.status(400).json({ 
  //     error: 'name missing' 
  //   })
  // }
  // Person.count({}).then(person=>console.log('find:', person))
  Person.exists({ name: body.name }).then(person=>{
    // console.log('person returned:', person)
    if(person!==null){
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }else{
      const person = new Person({
        name: body.name,
        number: body.number,
      })    
      person.save().then(savedPerson=>{
        response.json(savedPerson)
      })
      .catch(error => next(error))
    }
  })
  .catch(error=>next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body

  Person.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      console.log('updatedPerson', updatedPerson)
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})