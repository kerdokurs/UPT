const fs = require('fs');

const logs = fs.readdirSync('../logs/');

for (log of logs) {
  const data = fs.readFileSync('../logs/' + log).toString();
  const regexp = /(\d{4})-(\d{1,2})-(\d{1,2})/gi;

  const match = regexp.exec(log);

  const yr = match[1].substr(2),
    mt = '0' + match[2],
    dy = match[3].length == 1 ? '0' + match[3] : match[3];

  const toReplace = new RegExp(`${dy}/${mt}/${yr}`, 'g');
  const newData = data.replace(toReplace, `${dy}.${mt}.${match[1]}`);

  fs.writeFileSync('../logs/' + log, newData);
}
