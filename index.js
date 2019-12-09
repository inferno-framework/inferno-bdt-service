const express = require('express')
const bdt = require("bdt/bdt")
const app = express()
const serverKeys = require('./jwks').keys

const PORT = 4500
const API_PATH = '/api/tests'
const JWKS_PATH = '/jwks'
const JWKS_URL_TIMEOUT = 500;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.url}`);
  next();
})

bdt.load('./node_modules/bdt/testSuite/**/*.test.js');

app.get(API_PATH, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(bdt.getPath()));
})

app.post(API_PATH, (req, res) => {

  let runner = new bdt.Runner(req.body.settings);

  function writeEvent(data) {
    try {
      let stringData = JSON.stringify(data);
      console.log(`TEST EVENT: ${data.type}`);
      res.write(`${stringData}\n`);
    } catch (ex) {
      console.error("writeEvent: ", ex);
    }
    return data
  }

  function onStart() {
    writeEvent({ type: "start" })
  }

  function onGroupStart(data) {
    writeEvent({ type: "groupStart", data });
  }

  function onGroupEnd(data) {
    writeEvent({ type: "groupEnd", data });
  }

  function onTestStart(data) {
    writeEvent({ type: "testStart", data });
  }

  res.writeHead(200, { 'Content-Type': 'application/ndjson' });

  runner.on("start"     , onStart     );
  runner.on("groupStart", onGroupStart);
  runner.on("end"       , onEnd       );
  runner.on("groupEnd"  , onGroupEnd  );
  runner.on("testStart" , onTestStart );
  runner.on("testEnd"   , onTestEnd   );

  function onTestEnd(data) {
    // If only one test is called it seems like it doesn't ever reach test end
    writeEvent({ type: "testEnd", data });
    runner.removeAllListeners();
    res.end();
  }

  function onEnd() {
    writeEvent({ type: "end" });
    runner.removeAllListeners();
    res.end();
  }



  runner.run(bdt.getPath(req.body.path))
})

let currentKeys = {keys: serverKeys},
    currentKeyTimeout = 0;

const replaceKeys = (keys) => {
  console.log(`KEYSETS: Setting keyset (${keys.length} keys)`);
  currentKeys = JSON.parse(JSON.stringify({keys: keys}));
}


app.get(JWKS_PATH, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(currentKeys))
  res.end();
})

app.post(`${JWKS_PATH}/override`, (req, res) => {
  replaceKeys([JSON.parse(req.body.publicKey)]);
  console.log(JSON.parse(req.body.publicKey).kid)
  currentKeyTimeout = setTimeout(() => {
    clearTimeout(currentKeyTimeout)
    replaceKeys(serverKeys);
  }, JWKS_URL_TIMEOUT)
  res.end();
  
})

app.listen(PORT, () => console.log(`BDT Service API listening on port ${PORT}!`))

