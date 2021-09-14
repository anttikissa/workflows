let express = require('express')
let app = express()
let port = 3000
let log = console.log

app.get('/', (req, res) => {
	res.send('moi')
})

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
