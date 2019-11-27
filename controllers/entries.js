const handleEntries = (req,res, knex) => {
    if (req.body.id) {
        const {id} = req.body
        knex.select('entries').from('users')
        .where('id', '=', id)
        .then(entries => res.json(entries[0].entries))
        .catch(err => res.status(400).json('couldnt find id'))
    }
  
  
}
module.exports = {
    handleEntries: handleEntries
}
