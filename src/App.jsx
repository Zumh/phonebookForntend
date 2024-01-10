import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'
const Persons = ({ phonesToShow }) => {
  return (
    <div>
      {phonesToShow}
    </div>
  )
}

const Notification = ({message, messageType }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={messageType}>
      {message}
    </div>
  ) 
}

const Person = ({deleteHandler, person}) => {
  const {name, number, id} = person
  return (
    <div>
      {name} {number}  <button onClick={()=>deleteHandler(id)}>delete</button>
    </div>
  )
}

const Filter = ({handleSearchName, searchName}) => {
      return (
      <div>
        filter shown <input onChange={handleSearchName} value={searchName}  />
      </div>
      )
}


const PersonForm = ({ addInfo, handleNameChange, handlePhoneChange, newName, newPhone}) => {
  return (
  <form onSubmit={addInfo}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    
    <div>
      number: <input value={newPhone} onChange={handlePhoneChange} />
    </div>

    <div>
      <button type="submit">add</button>
    </div>
  </form>)
}

const App = () => {


  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  // fetch data from server
  useEffect(() => {
    personService
    .getAll()
    .then(initPerson =>{
      setPersons(initPerson)
    })
  }, [])


  const changedPhoneNumber = (samePerson) => {
    const id = samePerson.id
    
    const changedNumber = { ...samePerson, number: newPhone }
  
    personService
      .update(id, changedNumber).then(returnedPerson => {


        setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
        setMessage(`Updated ${samePerson.name}`)
        setMessageTimeOut('success')

      })
      .catch(error => {
        
        setPersons(persons.filter(person => person.id !== id))
        setMessage(`Information of ${samePerson.name} was already removed from server`)
        setMessageTimeOut('error')
      })
  }

  
  const addInfo = (event) => {
    event.preventDefault()
    const samePerson = persons.find(person => person.name === newName)
    // check if any duplicate name exist in the list before adding new one
    if (samePerson) {
      if (window.confirm(`${samePerson.name} is already added to phonebook, replace the old number`)){
        changedPhoneNumber(samePerson)

      }
    } else {
      const phoneObject = {
        name: newName,
        number: newPhone
      }
      
      personService
      .create(phoneObject)
      .then(returnedPerson => {
          // we create a new copy of old person object for us to maintain in the state
          setPersons(persons.concat(returnedPerson))

          // re-initialize empty state for new input
          setNewName('')
          setNewPhone('')

          setMessage(`Added ${returnedPerson.name}`)
          setMessageTimeOut('success')
  
      })

    }
  }

  const setMessageTimeOut = (currentMessageType) => {
        setMessageType(currentMessageType)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
  }
  
  const deleteHandler = (id) => {

    const person = persons.find(person => person.id === id)
    // check if any duplicate name exist in the list before adding new one
    if (window.confirm(`Delete ${person.name} ?`)) { 

      personService
      .remove(id)
      .then(returnedPerson =>{
        
          // if data is deleted then we update current state for Persons
          setPersons(persons.filter(person => person.id !== id ))

          setMessage(`Removed ${person.name}`)
         
          setMessageTimeOut('success')
  
      })
      .catch(error => {
       
        setPersons(persons.filter(person => person.id !== id))
        setMessage(
          `Information of ${person.name} was already removed from server`
        )
        setMessageTimeOut('error')
      })

    } 

  }
  
  

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handlePhoneChange = (event) => {

    setNewPhone(event.target.value)
  }

  const handleSearchName = (event) => {
    // we use setNewName because it always reset to empty string
    setSearchName(event.target.value)

  }

  // filter persons by search name in the list
  // if searchName is empty, return all persons
  // search is case insensitive
  const phonesToShow = searchName.length === 0 ? persons : persons.filter(person => person.name.toLowerCase() === searchName.toLowerCase())

  const handlePhonesToShow = phonesToShow.map(person => <Person key={person.id} deleteHandler={deleteHandler} person={person}/>)
  
  return (
    <div>

      <h2>Phonebook</h2>
      <h2>Search phone-number by name</h2>
      <Notification message={message} messageType={messageType}/>
      <Filter 
        handleSearchName={handleSearchName} 
        searchName={searchName}
      />

      <h2>Add a new phone number</h2>
      <PersonForm 
        addInfo={addInfo} 
        handleNameChange={handleNameChange} 
        handlePhoneChange={handlePhoneChange} 
        newName={newName} 
        newPhone={newPhone}
      />
     

      <h2>Numbers</h2>
      <Persons phonesToShow={handlePhonesToShow} />
      
    </div>
  )
}

export default App
