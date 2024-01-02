require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const morganBody = require('morgan-body');
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
morganBody(app);


let Data = [
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
    response.send('<h1>Hello</h1>')
})

app.get('/api/persons', (reqeuest, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const currentTime = new Date();
    response.send(`<p>Phonebook has info for ${Data.length} people</p> <p>${currentTime}</p>`)    
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
    .then(result => {
        response.status(204).end()
    })
    .catch(error => {
        next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))

})

const generateId = () => {
    const maxId = Data.length>0 ? Math.max(...Data.map(person => person.id)): 0
    return maxId + 1;
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: "Name required"
        })

    }else if(!body.number){
        return response.status(400).json({
            error: "Number required"
        })

    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unkown path'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}



app.use(errorHandler)

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})
