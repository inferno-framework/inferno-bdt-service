const express = require('express')
const bdt = require("bdt/bdt")
const app = express()
const port = 4500
const path = '/api/tests'

const config = require('./config')

app.use(express.json());

// const reporter = require("./res-stream")

// 2. Create and attach a reporter
// const reporter = require("./res-stream")();
// reporter.attach(runner);

// 3. Load tests
bdt.load('./node_modules/bdt/testSuite/**/*.test.js');

app.get(path, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(bdt.getPath()));
})

app.post(path, (req, res) => {

  // 1. Create a runner with the given settings
  let runner = new bdt.Runner(config);

  function writeEvent(data) {
    try {
      let stringData = JSON.stringify(data);
      console.log(data.type);
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
    // If only one group is called it seems like it doesn't ever reach test end
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

app.listen(port, () => console.log(`BDT Service API listening on port ${port}!`))

