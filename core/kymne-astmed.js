const router = require('express').Router();

const functions = require('./functions');

router.route('**').get(async (req, res) => {
  /* const aste = functions.kymneastmed.random();
  const number = Math.floor(Math.random() * 9) + 1;
  let nm;
  if (aste.power >= 1) nm = number.toString() + '' + kymme(aste.power);
  else nm = '0.' + kymme(Math.abs(aste.power) - 1) + '' + number.toString(); */

  const astmed = functions.kymneastmed.all();
  let astmed1 = [];
  for (let i in astmed) {
    const aste = astmed[i];
    const rn = Math.floor(Math.random() * 9) + 1;
    const number =
      aste.power >= 1
        ? rn.toString() + '' + kymme(aste.power)
        : '0.' + kymme(Math.abs(aste.power) - 1) + '' + rn.toString();

    astmed1.push({
      number: rn,
      nr: number,
      name: aste.name,
      power: aste.power
    });
  }

  /* res.render('astmed', {
    number: nm,
    aste
  }); */
  res.render('astmed', {
    astmed: astmed1
  });
});

function kymme(amt) {
  let str = '';
  for (let i = 0; i < amt; i++) str += '0';
  return str;
}

module.exports = router;
