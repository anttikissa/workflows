module.exports = (app) => {
	// Simulate the endpoint used by gcloud example (which doesn't work right
	// out of the box for reasons unknown, probably authentication)
	app.get('/datetime', (req, res) => {
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
			'Thursday', 'Friday', 'Saturday']

		res.send({
			dayOfTheWeek: days[new Date().getDay()]
		})
	})
}
