import { useState } from 'react';
import './ScientificCalculator.css';

const FUNCTIONS = {
  sin: { label: 'sin', fn: Math.sin },
  cos: { label: 'cos', fn: Math.cos },
  tan: { label: 'tan', fn: Math.tan },
  asin: { label: 'sin⁻¹', fn: Math.asin },
  acos: { label: 'cos⁻¹', fn: Math.acos },
  atan: { label: 'tan⁻¹', fn: Math.atan },
  sqrt: { label: '√', fn: Math.sqrt },
  log: { label: 'log', fn: Math.log10 },
  ln: { label: 'ln', fn: Math.log },
  abs: { label: '|x|', fn: Math.abs },
  exp: { label: 'eˣ', fn: Math.exp },
};

const FACTORIAL = (n) => {
  if (!Number.isInteger(n) || n < 0 || n > 170) {
    throw new Error('Factorial requires an integer from 0 to 170.');
  }

  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
};

function tokenize(expression) {
  const tokens = [];
  let i = 0;

  while (i < expression.length) {
    const rest = expression.slice(i);

    if (/^\s+/.test(rest)) {
      i += rest.match(/^\s+/)[0].length;
      continue;
    }

    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) {
      const value = Number(number[0]);
      if (!Number.isFinite(value)) throw new Error('Number is out of range.');
      tokens.push({ type: 'number', value });
      i += number[0].length;
      continue;
    }

    const identifier = rest.match(/^[a-zA-Z]+/);
    if (identifier) {
      tokens.push({ type: 'identifier', value: identifier[0].toLowerCase() });
      i += identifier[0].length;
      continue;
    }

    if ('+-*/^!()%'.includes(expression[i])) {
      tokens.push({ type: 'operator', value: expression[i] });
      i += 1;
      continue;
    }

    throw new Error(`Unsupported character: ${expression[i]}`);
  }

  // Insert multiplication for forms such as 2π, 2(3+4), and 2sin(30).
  const expanded = [];

  for (const token of tokens) {
    const previous = expanded[expanded.length - 1];

    const previousEndsValue =
      previous &&
      (previous.type === 'number' ||
        previous.type === 'identifier' ||
        previous.value === ')' ||
        previous.value === '!');

    const currentStartsValue =
      token.type === 'number' ||
      token.type === 'identifier' ||
      token.value === '(';

    if (previousEndsValue && currentStartsValue) {
      expanded.push({ type: 'operator', value: '*' });
    }

    expanded.push(token);
  }

  return expanded;
}

function calculate(expression, degrees) {
  const tokens = tokenize(expression);
  let position = 0;

  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  const checked = (value) => {
    if (!Number.isFinite(value)) {
      throw new Error('Math error: result is outside the valid range.');
    }
    return value;
  };

  function primary() {
    const token = consume();

    if (!token) throw new Error('Incomplete expression.');

    if (token.type === 'number') return token.value;

    if (token.value === '(') {
      const value = sum();
      if (!peek() || consume().value !== ')') {
        throw new Error('Missing closing bracket.');
      }
      return value;
    }

    if (token.type === 'identifier') {
      const name = token.value;

      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;

      if (!Object.hasOwn(FUNCTIONS, name)) {
        throw new Error(`Unknown function: ${name}`);
      }

      if (!peek() || consume().value !== '(') {
        throw new Error(`${name} requires parentheses.`);
      }

      const argument = sum();

      if (!peek() || consume().value !== ')') {
        throw new Error('Missing closing bracket.');
      }

      let input = argument;

      if (degrees && ['sin', 'cos', 'tan'].includes(name)) {
        input = (argument * Math.PI) / 180;
      }

      if (degrees && ['asin', 'acos', 'atan'].includes(name)) {
        return checked((FUNCTIONS[name].fn(argument) * 180) / Math.PI);
      }

      if (name === 'sqrt' && argument < 0) {
        throw new Error('Square root of a negative number is not real.');
      }

      if (name === 'log' && argument <= 0) {
        throw new Error('Logarithm requires a positive number.');
      }

      if (name === 'ln' && argument <= 0) {
        throw new Error('Natural logarithm requires a positive number.');
      }

      if (name === 'tan' && Math.abs(Math.cos(input)) < 1e-12) {
        throw new Error('Tangent is undefined at this angle.');
      }

      return checked(FUNCTIONS[name].fn(input));
    }

    if (token.value === '-') return checked(-unary());
    if (token.value === '+') return unary();

    throw new Error('Unexpected value.');
  }

  function postfix() {
    let value = primary();

    while (peek() && ['!', '%'].includes(peek().value)) {
      const operator = consume().value;

      if (operator === '!') value = checked(FACTORIAL(value));
      if (operator === '%') value = checked(value / 100);
    }

    return value;
  }

  function power() {
    let value = postfix();

    if (peek() && peek().value === '^') {
      consume();
      value = checked(value ** unary());
    }

    return value;
  }

  function unary() {
    if (peek() && peek().value === '-') {
      consume();
      return checked(-unary());
    }

    if (peek() && peek().value === '+') {
      consume();
      return unary();
    }

    return power();
  }

  function product() {
    let value = unary();

    while (peek() && ['*', '/', '%'].includes(peek().value)) {
      const operator = consume().value;
      const right = unary();

      if (operator === '/' && right === 0) {
        throw new Error('Cannot divide by zero.');
      }

      value = checked(
        operator === '*'
          ? value * right
          : operator === '/'
            ? value / right
            : value % right,
      );
    }

    return value;
  }

  function sum() {
    let value = product();

    while (peek() && ['+', '-'].includes(peek().value)) {
      const operator = consume().value;
      const right = product();
      value = checked(operator === '+' ? value + right : value - right);
    }

    return value;
  }

  if (!tokens.length) throw new Error('Enter a calculation first.');

  const result = sum();

  if (position !== tokens.length) {
    throw new Error('Check your expression and brackets.');
  }

  return result;
}

const BUTTONS = [
  ['sin', 'cos', 'tan', '(', ')', 'AC'],
  ['asin', 'acos', 'atan', '√', 'x²', '⌫'],
  ['log', 'ln', '!', 'π', 'e', '÷'],
  ['7', '8', '9', '^', '%', '×'],
  ['4', '5', '6', '(', ')', '−'],
  ['1', '2', '3', '.', '±', '+'],
  ['0', '00', 'Ans', '×10ˣ', '=', '÷'],
];

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [error, setError] = useState('');
  const [degrees, setDegrees] = useState(true);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState(0);

  function append(value) {
    setExpression((previous) => previous + value);
    setError('');
  }

  function clear() {
    setExpression('');
    setResult('0');
    setError('');
  }

  function backspace() {
    setExpression((previous) => previous.slice(0, -1));
    setError('');
  }

  function insertFunction(name) {
    append(`${name}(`);
  }

  function press(button) {
    if (button === 'AC') return clear();
    if (button === '⌫') return backspace();

    if (button === '=') {
      try {
        const value = calculate(expression, degrees);
        const formatted = Number(value.toPrecision(12)).toString();

        setResult(formatted);
        setAnswer(value);
        setError('');
        setHistory((previous) =>
          [{ expression, result: formatted }, ...previous].slice(0, 10),
        );
      } catch (err) {
        setError(err.message || 'Unable to calculate this expression.');
      }
      return;
    }

    if (button === '±') {
      if (!expression) return append('-');
      append('*(-1)');
      return;
    }

    if (button === 'Ans') return append(String(answer));
    if (button === 'π') return append('pi');
    if (button === '√') return insertFunction('sqrt');
    if (button === 'x²') return append('^2');
    if (button === '×10ˣ') return append('*10^');
    if (button === '÷') return append('/');
    if (button === '×') return append('*');
    if (button === '−') return append('-');

    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln'].includes(button)) {
      return insertFunction(button);
    }

    append(button);
  }

  return (
    <section className="scientific-calculator">
      <header className="scientific-header">
        <div>
          <span className="scientific-eyebrow">ZANAHUB · CALCULATORS</span>
          <h2>Scientific Calculator</h2>
          <p>Everyday maths to advanced calculations.</p>
        </div>

        <button
          type="button"
          className="angle-toggle"
          onClick={() => setDegrees((previous) => !previous)}
        >
          {degrees ? 'DEG' : 'RAD'}
        </button>
      </header>

      <div className="calculator-layout">
        <div className="calculator-main">
          <div className="calculator-display">
            <div className="calculator-expression" aria-label="Expression">
              {expression || 'Enter a calculation'}
            </div>

            <div className="calculator-result" aria-live="polite">
              {result}
            </div>

            {error && <p className="calculator-error">{error}</p>}
          </div>

          <div className="calculator-buttons">
            {BUTTONS.flat().map((button, index) => (
              <button
                type="button"
                key={`${button}-${index}`}
                className={[
                  'calc-button',
                  ['AC', '⌫'].includes(button) ? 'calc-action' : '',
                  ['+', '−', '×', '÷', '^', '%', '!'].includes(button)
                    ? 'calc-operator'
                    : '',
                  button === '=' ? 'calc-equals' : '',
                  ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln'].includes(button)
                    ? 'calc-function'
                    : '',
                ].filter(Boolean).join(' ')}
                onClick={() => press(button)}
              >
                {button}
              </button>
            ))}
          </div>

          <p className="calculator-hint">
            Tip: use parentheses to group expressions. Trigonometric functions
            use {degrees ? 'degrees' : 'radians'}.
          </p>
        </div>

        <aside className="calculator-history">
          <div className="history-heading">
            <h3>History</h3>
            <button
              type="button"
              onClick={() => setHistory([])}
              disabled={history.length === 0}
            >
              Clear
            </button>
          </div>

          {history.length === 0 ? (
            <p className="history-empty">Your calculations will appear here.</p>
          ) : (
            <ul>
              {history.map((item, index) => (
                <li key={`${item.expression}-${index}`}>
                  <button
                    type="button"
                    className="history-item"
                    onClick={() => {
                      setExpression(item.expression);
                      setResult(item.result);
                      setError('');
                    }}
                  >
                    <span>{item.expression}</span>
                    <strong>= {item.result}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
