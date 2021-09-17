let express = require('express')
let got = require('got')
let template = require('lodash.template')
let lodashGet = require('lodash.get')
let querystring = require('querystring')

let app = express()
let port = 3000
let log = console.log

function error(message, more) {
	if (more) {
		message += ' ' + JSON.stringify(more)
	}
	throw new Error(message)
}

app.use(express.json())

app.get('/', (req, res) => {
	res.send('hello')
})

let workflows = []
let workflowsNextId = 1

let Workflow = {
	create: ({ name, steps }) => {
		let id = workflowsNextId++
		workflows.push({
			id,
			name,
			steps
		})
		return id
	},

	findById: (id) => {
		return workflows.find(w => w.id === id)
	},

	findByName: (name) => {
		// Find the most recent workflow with the given name
		return [...workflows].reverse().find(w => w.name === name)
	}
}

//
// Workflows
//

app.post('/workflows', (req, res) => {
	// This probably works differently than Google Cloud in that you can
	// create multiple workflows with the same name. This allows us to keep
	// the API and deploy script as simple as possible for now.
	log('POST /workflows', req.body)
	let workflow = req.body

	if (typeof workflow.name !== 'string') {
		error('workflow name missing')
	}

	if (typeof workflow.steps !== 'object') {
		// yes, you can trick this with null
		error('workflow steps missing')
	}

	let id = Workflow.create({
		name: workflow.name,
		steps: workflow.steps
	})

	res.send({ id })
})

app.get('/workflows/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`GET /workflows/${id}`)

	let workflow = Workflow.findById(id)
	res.send(workflow || error('workflow not found'))
})

app.get('/workflows', (req, res) => {
	log('GET /workflows')

	res.send(workflows)
})

app.patch('/workflows/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`PATCH /workflows/${id}`)

	let workflow = Workflow.findById(id)
	if (!workflow) {
		error('workflow not found')
	}

	// TODO maybe should validate
	Object.assign(workflow, req.body)

	res.send(workflow)
})

//
// Executions
//

let executions = []
let executionsNextId = 1

// evaluate('hello ${name}', { name: 'Antti' }') => 'hello Antti'
function evaluate(query, context) {
	return template(query)(context)
}

let Execution = {
	create: async (workflow) => {
		let id = executionsNextId++

		let execution = {
			id,
			workflow,
			status: 'running',
			result: null,
			message: null,
			step: 0,
			context: {}
		}

		executions.push(execution)

		return Execution.run(execution)
	},

	findById: (id) => {
		return executions.find(w => w.id === id)
	},

	run: async (execution) => {
		while (true) {
			let stepObject = execution.workflow.steps[execution.step]

			if (!stepObject) {
				execution.status = 'error'
				execution.message = 'ran out of steps'
				error('ran out of steps')
			}

			let stepNames = Object.keys(stepObject)
			if (stepNames.length !== 1) {
				error('step must have exactly 1 key', stepObject)
			}
			let stepName = stepNames[0]
			let step = stepObject[stepName]

			if (step.call === 'http.get') {
				if (!step.args || !step.args.url) {
					error(`step ${stepName} needs args.url`, step)
				}

				try {
					let url = step.args.url
					let queryString = ''
					if (step.args.query) {
						let query = { ...step.args.query }
						for (let param in query) {
							query[param] = evaluate(query[param],
								execution.context)
						}

						queryString = '?' + querystring.encode(query)
					}

					let httpResult = await got(url + queryString, {
						responseType: 'json'
					})

					if (!step.result) {
						error(`step ${stepName} needs result`, step)
					}

					execution.context[step.result] = {
						body: httpResult.body
					}
				} catch (e) {
					execution.status = 'error'
					execution.message = e.message
					log(`http error in step ${stepName}: ${e.message}`,
						step)
					return execution
				}
			} else if (step.return) {
				if (typeof step.return !== 'string') {
					error(`step ${stepName}: step.return must be a string`, step)
				}

				// return has a special form '${<whatever>}' where <whatever>
				// might not evaluate to a string (unlike in other evaluations)
				// so we need to handle that differently
				let returnMatch = step.return.match(/^\${(.*)}$/)

				if (!returnMatch) {
					error(`step ${stepName}: step.return must look like \${...}`)
				}

				execution.result = lodashGet(execution.context, returnMatch[1])
				execution.status = 'succeeded'

				return execution
			} else if (step.assign) {
				for (let assignStep of step.assign) {
					let assignStepKeys = Object.keys(assignStep)
					if (assignStepKeys.length !== 1) {
						error('assign step must have exactly 1 key', step)
					}
					let assignStepKey = assignStepKeys[0]

					let value = evaluate(assignStep[assignStepKey],
						execution.context)
					execution.context[assignStepKey] = value
				}
			} else {
				error('unknown step type', step)
			}

			execution.step++
		}
	}
}

app.post('/executions', async (req, res, next) => {
	try {
		log('POST /executions', req.body)

		let name = req.body.name

		if (!name) {
			error('name is required')
		}

		let workflow = Workflow.findByName(name)
		if (!workflow) {
			error('workflow not found')
		}

		let result = await Execution.create(workflow)

		res.send(result)
		// res.send('ok')
	} catch (e) {
		return next(e)
	}
})

app.get('/executions/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`GET /executions/${id}`)

	let execution = Execution.findById(id)
	res.send(execution || error('workflow not found'))
})

app.get('/executions', (req, res) => {
	log('GET /executions')

	res.send(executions)
})

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
