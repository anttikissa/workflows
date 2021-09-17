function error(message, more) {
	if (more) {
		message += ' ' + JSON.stringify(more)
	}
	throw new Error(message)
}

module.exports = {
	error,
	log: console.log
}
