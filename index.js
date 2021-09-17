let express = require('express')

let { log } = require('./util')

let app = express()
let port = 3000

app.use(express.json())

require('./routes/workflows')(app)
require('./routes/executions')(app)
require('./routes/misc')(app)

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
