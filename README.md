# Javascript Functional Reactive Programming Utilities

Lean and slim FRP library.

## Declaring a reactive variable

```javascript
x = Variable('0')
```

## Changing it

```javascript
x('1')
x('2')
```

## Piping the changes around

```javascript
nums = x.map(parseFloat)

sum_of_evens = nums
	.filter(x => (x % 2) === 0)
	.scan((a,b) => a+b, 0)

sum_of_odds = nums
	.filter(x => (x % 2) === 1)
	.scan((a,b) => a+b, 0)
```

## Zipping multiple results

```javascript
evens_minus_odds = sum_of_evens.zip(sum_of_odds)
	.map([evens, odds] => evens - odds)
```

## Displaying the results

```javascript
document.body.appendChild(
	E('div', { class: 'my-app' }, [ even_minus_odds ])
)
```
