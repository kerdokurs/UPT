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
  generate: data => {
    const { variables, variants, mathjax } = data;
    const variantId = Math.floor(Math.random() * variants.length);
    const { text, formula, precision } = variants[variantId];

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
      formula,
      variantId
    };
  },
  quiz: {
    generate: data => {
      data.elements = functions.shuffleArray(data.elements);

      return data;
    },
    verify: (verifier, body) => {
      const { data } = verifier;

      const returnData = [];

      for (const element of data.elements) {
        const { id, type, question, answer, points, options } = element;

        const provided = body['field-' + id];

        if (!provided || provided == '') {
          returnData.push({
            id,
            question,
            points: 0,
            correctAnswer: answer,
            correct: false,
            provided
          });
          continue;
        }

        let correct = false;
        if (type == 'field') {
          if (provided == answer) correct = true;
        } else {
          if (options[answer] == provided) correct = true;
        }

        returnData.push({
          id,
          question,
          points: points,
          correctAnswer: type == 'field' ? answer : options[answer],
          correct,
          provided
        });
      }

      return returnData;
    }
  }
};
