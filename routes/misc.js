module.exports = (app) => {
	// Simulate the endpoint used by gcloud example
	// (which didn't work for some reason but now it does again, so just
	// ignore this)
	app.get('/datetime', (req, res) => {
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
			'Thursday', 'Friday', 'Saturday']

		res.send({
			dayOfTheWeek: days[new Date().getDay()]
		})
	})
}
