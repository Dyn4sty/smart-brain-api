const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt-nodejs')
const knex = require('knex')({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: true

    }
  });



const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
       res.send('it is working')
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
                return knex.select('*').from('users').where('email', '=', email)
                .then(user => {
                    res.status(200).json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(500).json('failed')
            }
        }

    }).catch(err => res.status(400).json('unable to sign in'))
    
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


app.put('/image', (req,res) => {
    const {id} = req.body
    knex('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
})

app.put('/entries', (req,res) => {
    if (req.body.id) {
        const {id} = req.body
        knex.select('entries').from('users')
        .where('id', '=', id)
        .then(entries => res.json(entries[0].entries))
        .catch(err => res.status(400).json('couldnt find id'))
    }


})
app.listen(process.env.PORT || 3000)
