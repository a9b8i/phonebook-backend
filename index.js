require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(express.static('build'))
const morganBody = require('morgan-body')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
morganBody(app)

app.get('/', (request, response) => {
  response.send('<h1>Hello</h1>')
})

app.get('/api/persons', (reqeuest, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      return next(error)
    })

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if(!body.name){
    return response.status(400).json({
      error: 'Name required'
    })

  }else if(!body.number){
    return response.status(400).json({
      error: 'Number required'
    })

  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number },  { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown path' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}



app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})

