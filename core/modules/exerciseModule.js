const generateExercise = (variables, variants) => {
  const variantId = Math.floor(Math.random() * variants.length);
  const variant = variants[variantId];

  let { text, formula } = variant;

  const precision = 2;

  const _variables = [];

  for (let variable of variables) {
    const { name, unit, min: _min, max: _max } = variable;
    const min = parseFloat(_min);
    const max = parseFloat(_max);

    const value = Math.floor(Math.random() * (max - min) + min);
    console.log(value);

    const regex = new RegExp('<' + name + '>', 'gi');
    text = text.replace(regex, `<b>${value} ${unit}</b>`);
    formula = formula.replace(regex, value);

    _variables.push = {
      name,
      value
    };
  }

  const answer = parseFloat(eval(formula)).toFixed(precision);

  return {
    variantId,
    answer,
    text,
    precision
  };
};

module.exports = {
  generateExercise
};
