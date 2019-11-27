const handleSignin = (knex, bcrypt) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }

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
}

module.exports = {
  handleSignin: handleSignin
}