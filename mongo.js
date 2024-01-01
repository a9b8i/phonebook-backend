const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}



const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://phonebook:${password}@cluster0.otocaxj.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', contactSchema)

if (process.argv.length === 3){
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}

const person = new Person({
  name: name,
  number: number,
})

person.save().then(result => {
  console.log(`added ${name} ${number} to phonebook`)
  mongoose.connection.close()
})