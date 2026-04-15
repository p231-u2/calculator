const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");

const operationSymbols = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

let currentValue = "0";
let previousValue = null;
let pendingOperation = null;
let justEvaluated = false;
let repeatOperand = null;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 10,
  }).format(value);
}

function parseCurrent() {
  return Number(currentValue.replace(/,/g, ""));
}

function setDisplay(value) {
  const safeValue = value.length > 12 ? Number(value).toExponential(6) : value;
  display.textContent = safeValue;
}

function refreshDisplay() {
  setDisplay(currentValue);
  history.textContent = previousValue !== null && pendingOperation
    ? `${formatNumber(previousValue)} ${operationSymbols[pendingOperation]}`
    : "";
}

function applyOperation(a, b, operation) {
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function inputDigit(digit) {
  if (justEvaluated && !pendingOperation) {
    currentValue = "0";
    justEvaluated = false;
  }

  if (currentValue === "0") {
    currentValue = digit;
  } else {
    currentValue += digit;
  }

  refreshDisplay();
}

function inputDecimal() {
  if (justEvaluated && !pendingOperation) {
    currentValue = "0";
    justEvaluated = false;
  }

  if (!currentValue.includes(".")) {
    currentValue += ".";
  }

  refreshDisplay();
}

function clearAll() {
  currentValue = "0";
  previousValue = null;
  pendingOperation = null;
  repeatOperand = null;
  justEvaluated = false;
  refreshDisplay();
}

function toggleSign() {
  const value = parseCurrent();
  currentValue = String(value * -1);
  refreshDisplay();
}

function toPercent() {
  const value = parseCurrent();
  currentValue = String(value / 100);
  refreshDisplay();
}

function chooseOperator(operator) {
  const current = parseCurrent();

  if (previousValue !== null && pendingOperation && !justEvaluated) {
    const result = applyOperation(previousValue, current, pendingOperation);
    currentValue = Number.isFinite(result) ? String(result) : "Error";
    previousValue = Number.isFinite(result) ? result : null;
  } else {
    previousValue = current;
  }

  pendingOperation = operator;
  justEvaluated = false;
  currentValue = "0";
  updateOperatorState();
  refreshDisplay();
}

function evaluate() {
  if (!pendingOperation) {
    return;
  }

  const current = parseCurrent();
  const operand = justEvaluated ? repeatOperand : current;
  const result = applyOperation(previousValue, operand, pendingOperation);

  if (!Number.isFinite(result)) {
    currentValue = "Error";
    previousValue = null;
    pendingOperation = null;
    repeatOperand = null;
  } else {
    currentValue = String(result);
    history.textContent = `${formatNumber(previousValue)} ${operationSymbols[pendingOperation]} ${formatNumber(operand)} =`;
    previousValue = result;
    repeatOperand = operand;
    justEvaluated = true;
  }

  updateOperatorState();
  setDisplay(currentValue);
}

function updateOperatorState() {
  document.querySelectorAll('.btn.operator[data-action="operator"]').forEach((button) => {
    button.classList.toggle("active", button.dataset.value === pendingOperation && !justEvaluated);
  });
}

function flashButton(button) {
  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 120);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    flashButton(button);

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case "digit":
        inputDigit(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        toPercent();
        break;
      case "operator":
        chooseOperator(value);
        break;
      case "equals":
        evaluate();
        break;
      default:
        break;
    }
  });
});

refreshDisplay();
