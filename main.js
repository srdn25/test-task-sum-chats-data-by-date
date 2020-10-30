const https = require('https');
const Buffer = require('buffer').Buffer;

const DATA_URL = 'https://bitbucket.org/!api/2.0/snippets/tawkto/aA8zqE/4f62624a75da6d1b8dd7f70e53af8d36a1603910/files/webstats.json';

async function processStatistics(startDate, endDate) {
  if (startDate && endDate && !(startDate instanceof Date || endDate instanceof Date)) {
    throw Error('You passed incorrect date in arguments');
  }

  let data = null;

  try {
    data = await new Promise((resolve, reject) => https.get(DATA_URL, (res) => {
      const buff = [];

      res.on('data', (data) => buff.push(data));
      res.on('error', (err) => reject(err));
      res.on('end', () => resolve(Buffer.concat(buff).toString('utf8')));
    }));

    data = JSON.parse(data);

  } catch (err) {
    console.error(err);
    data = require('./data.json');
  }

  const reducedData = data.reduce((acc, { websiteId, date, chats, missedChats }) => {
    const elDate = new Date(date).getTime();

    const checkDate = (startDate && endDate)
      ? elDate <= endDate.getTime() && elDate >= startDate.getTime()
      : true;

    if (checkDate) {
      if (!acc[websiteId]) {
        acc[websiteId] = {
          websiteId,
          chats,
          missedChats,
        }
      } else {
        acc[websiteId].chats = acc[websiteId].chats + chats;
        acc[websiteId].missedChats = acc[websiteId].missedChats + missedChats;
      }
    }

    return acc;
  }, {});

  return Object.values(reducedData);
};


processStatistics().then((withoutDate) => console.log({ withoutDate }));

processStatistics(new Date(2019, 3, 1), new Date(2019, 3, 2)).then((withDate) => console.log({ withDate }));

processStatistics(1, 5)
  .then((withWrongDate) => console.log({ withWrongDate }))
  .catch((err) => console.error(err));
