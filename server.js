const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt-nodejs')
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'smart-brain'
    }
  });



const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    knex.select('*').from('users').then(data => {
        res.send(data)
    })
    
})

app.post('/signin', (req,res) => {
    const {email, password} = req.body
    loginEmail = email.toLowerCase()
    knex.select('*').from('login')
    .where('email', '=',loginEmail)
    .then(data => {
        if (data[0].email) {
            const {email, hash} = data[0]
            if (email === loginEmail && bcrypt.compareSync(password, hash) ) {
                res.status(200).json('success')
            } else {
                res.status(500).json('failed')
            }
        }

    }).catch(console.log)
    
})

app.post('/register', (req,res) => {
    
    if (req.body.name.length > 2 && req.body.email.length > 4 && req.body.password.length > 4) {
        const {name, email, password} = req.body
        const hash = bcrypt.hashSync(password)
        knex.transaction(trx => {
            trx.insert({
              hash,
              email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
              return trx('users')
                .returning('*')
                .insert({
                  email: loginEmail[0],
                  name: name,
                  joined: new Date()
                })
                .then(user => {
                  res.json(user);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
          })
          .catch(err => res.status(400).json('Email already exists'))
    
    }

     else {
         res.json('failed')
     }



})


app.get('/profile/:id', (req,res) => {
    let found = false
    if (req.params) {
        const {id} = req.params
        database.users.map(item => {
            if (id === item.id) {
                return res.json(item)
            }
        })
    }
    if (!found) {
        res.sendStatus(404)
    }
}) 
app.put('/image', (req,res) => {
    const {id} = req.body
    knex('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
})


app.listen(3000)
