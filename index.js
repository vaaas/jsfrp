function Reactive(f) {
	return Object.assign(f, { ws: [], constructor: }, proto)
}

export function Variable() {
	function me(x) {
		me.x = x
		me.notify(x)
	}
	me.x = undefined
	return me
}

export function EventStream(elem, event) {
	const r = Reactive(notify())
	elem.addEventListener(event, r)
	return r
}

export function zip(...rs) {
	const me = debounce(0)

	const xs = []
	for (let i = 0, len = rs.length; i < len; i++) {
		xs.push(undefined)
		rs[i].each(x => { xs[i] = x; me(xs) })
	}

	return Reactive(me)
}

function notify() {
	return function me(x) { return me.notify(x) }
}

function map(f) {
	return function me(x) { return me.notify(f(x)) }
}

function filter(f) {
	return function me(x) { return f(x) ? me.notify(x) : this }
}

function scan(f, i) {
	return function me(x) { return me.notify(i = f(i, x)) }
}

function debounce(t) {
	let id, val

	function bounce() {
		id = undefined
		return me.notify(val)
	}

	function me(x) {
		if (id) clearTimeout(id)
		val = x
		id = setTimeout(bounce, t)
	}

	return me
}

const proto = {
	each(x) {
		this.ws.push(x)
		return this
	},

	observe(x) {
		x.each(this)
		return this
	},

	notify(x) {
		for (let i = 0, len = this.ws.length; i < len; i++)
			this.ws[i](x)
		return this
	},

	map(f) { return Reactive(map(f)).observe(this) },
	filter(f) { return Reactive(filter(f)).observe(this) },
	scan(f, i) { return Reactive(scan(f, i)).observe(this) },
	debounce(t) { return Reactive(debounce(t)).observe(this) },

	merge(...rs) {
		const x = Reactive().observe(this)
		for (let i = 0, len = rs.length; i < len; i++)
			x.observe(rs[i])
		return x
	},
}
