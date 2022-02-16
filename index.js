function Variable(f=undefined) {
	return Object.assign(f || set(), { x: undefined, ws: [] }, Variable.prototype)
}

function set() {
	return function me(x) { return me.set(x) }
}

function map(f) {
	return function me(x) { return me.set(f(x)) }
}

function filter(f) {
	return function me(x) { return f(x) ? me.set(x) : this }
}

function scan(f, i) {
	return function me(x) { return me.set(i = f(i, x)) }
}

function debounce(t) {
	let id, val

	function bounce() {
		id = undefined
		return me.set(val)
	}

	function me(x) {
		if (id) clearTimeout(id)
		val = x
		id = setTimeout(bounce, t)
	}

	return me
}

function zip(...rs) {
	const me = debounce(0)

	const xs = []
	for (let i = 0, len = rs.length; i < len; i++) {
		xs.push(undefined)
		rs[i].subscribe(x => { xs[i] = x; me(xs) })
	}
	return me
}

Variable.prototype = {
	subscribe(x) {
		this.ws.push(x)
		return this
	},

	observe(x) {
		x.subscribe(this)
		return this
	},

	notify() {
		for (let i = 0, len = this.ws.length; i < len; i++)
			this.ws[i](this.x)
		return this
	},

	set(x) {
		this.x = x
		return this.notify()
	},

	each(f) { return this.subscribe(f) },
	map(f) { return new Variable(map(f)).observe(this) },
	filter(f) { return new Variable(filter(f)).observe(this) },
	scan(f, i) { return new Variable(scan(f, i)).observe(this) },
	debounce(t) { return new Variable(debounce(t)).observe(this) },
	zip(...rs) { return new Variable(zip(this, ...rs)) },

	merge(...rs) {
		const x = Variable().observe(this)
		for (let i = 0, len = rs.length; i < len; i++)
			x.observe(rs[i])
		return x
	},
}
