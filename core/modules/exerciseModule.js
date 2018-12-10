const fs = require('fs');

const functions = require('../functions');

module.exports = {
  astmed: {
    generate: async () => {
      const fields = ['token', 'power', 'name'];
      const file = fs.readFileSync('./data/kymne-astmed.json').toString();
      const data = JSON.parse(file);

      const table = [];
      for (aste of data) {
        const random = Math.floor(Math.random() * fields.length);
        const fieldToFillIn = fields[random];

        table.push({
          token: fieldToFillIn === 'token' ? aste[fieldToFillIn] : null,
          power: fieldToFillIn === 'power' ? aste[fieldToFillIn] : null,
          name: fieldToFillIn === 'name' ? aste[fieldToFillIn] : null,
          id: aste[fieldToFillIn]
        });
      }

      return functions.shuffleArray(table);
    },
    check: async data => {}
  },
  generate: async data => {
    const { variables, text, formula, mathjax, precision } = data;

    let newText = text;
    newFormula = formula;
    const newVariables = {};
    for (const v in variables) {
      const variable = variables[v];

      const { type, min, max } = variable;

      const random = Math.floor(Math.random() * (max - min) + min);

      const regex = new RegExp('<' + v + '>', 'gi');
      newText = newText.replace(regex, `<b>${random} ${type}</b>`);
      newFormula = newFormula.replace(regex, random);
      newVariables[v] = random;
    }

    const answer = parseFloat(eval(newFormula)).toFixed(precision);

    return {
      text: newText,
      answer,
      mathjax,
      precision,
      variables: newVariables,
      formula
    };
  }
};
