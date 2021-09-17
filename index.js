let express = require('express')

let Execution = require('./model/Execution')
let Workflow = require('./model/Workflow')
let { error, log } = require('./util')

let app = express()
let port = 3000

app.use(express.json())

app.get('/', (req, res) => {
	res.send('hello')
})

require('./routes/workflows')(app)
require('./routes/executions')(app)

// Simulate the endpoint used by gcloud example (which doesn't work right
// out of the box for reasons unknown, probably authentication)
app.get('/datetime', (req, res) => {
	let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thursday', 'Friday', 'Saturday']

	res.send({
		dayOfTheWeek: days[new Date().getDay()]
	})
})

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
