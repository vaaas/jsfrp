function Reactive(f, obj={}) {
	return Object.assign(f, { ws: [], constructor: Reactive, ...obj }, proto)
}

export function Variabl(x=undefined) {
	const r = Reactive(set(), { x: undefined })
	if (x !== undefined)
		setTimeout(() => r(x), 0)
	return r
}

export function Observable(f) { return Reactive(f) }

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
	return me
}

export function E(name, attrs={}, children=[]) {
	const elem = document.createElement(name)

	for (const [k, v] of Object.entries(attrs)) {
		switch(k) {
		case 'class':
			if (Array.isArray(v))
				elem.className = v.join(' ')
			else if (v.constructor === Reactive)
				v.each(x => elem.className = Array.isArray(x) ? x.join(' ') : x)
			else
				elem.classname = v
			break

		default:
			if (v.constructor === Reactive)
				v.each(x => elem[k] = x)
			else
				elem[k] = v
			break
		}
	}

	for (const x of children) {
		if (typeof x === 'string')
			elem.appendChild(document.createTextNode(x))
		else if (typeof x === 'number')
			elem.appendChild(document.createTextNode(''+x))
		else if (x.constructor === Reactive) {
			const node = document.createTextNode('')
			x.each(x => node.textcontent = x)
			elem.appendChild(node)
		}
	}

	return elem
}

function notify() {
	return function me(x) { return me.notify(x) }
}

function set() {
	return function me(x) { return me.notify(me.x = x) }
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

	map(f) { return Observable(map(f)).observe(this) },
	filter(f) { return Observable(filter(f)).observe(this) },
	scan(f, i) { return Observable(scan(f, i)).observe(this) },
	debounce(t) { return Observable(debounce(t)).observe(this) },
	zip(...rs) { return Observable(zip(this, ...rs)) },

	merge(...rs) {
		const x = Observable().observe(this)
		for (let i = 0, len = rs.length; i < len; i++)
			x.observe(rs[i])
		return x
	},
}
