let got = require('got')
let template = require('lodash.template')
let lodashGet = require('lodash.get')
let querystring = require('querystring')

let { error } = require('../util')

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

	getAll: () => {
		return executions
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

module.exports = Execution
