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
  }
};
