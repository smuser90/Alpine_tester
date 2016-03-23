function testServer(tests, serial) {
  var testObjects = require(tests).testObjects;

  var fs = require('fs');
  var PORT = 3000;
  var AlpineTest = require('./AlpineTest').AlpineTest;
  var app = require('express')();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var sp = require("serialport");
  var SerialPort = sp.SerialPort;
  var serialPort = new SerialPort("/dev/tty.usbmodem" + serial, {
    baudrate: 115200,
    parser: sp.parsers.readline("\n")
  }, false);
  var chalk = require('chalk');
  var table = require('text-table');

  var mSocket;
  var mAssert = '';
  var mAssertListen = false;
  var mRecordSerial = false;
  var mSerialRecording = '';
  var mAssertTimeout;
  var mCommandTimeout;
  var mTestInst;
  var mResult; var mCamCode = null;
  var mCurrTest = 0;

  var mTimestamp = 0;

  var mTests = [];

  function nop(result) {}

  io.on('connection', function(socket) {
    console.log(chalk.green("Radian App connected!"));
    mSocket = socket;

    startSerial();

    socket.on('result', commandResult);
  });

  console.reset = function () {
    return process.stdout.write('\033c');
  }

  server.listen(PORT, function() {
    console.log(chalk.green('Alpine TestServer online. \nListening on port: ' + PORT + '\n'));
  });

  function startSerial() {
    serialPort.open(function(error) {
      if (error) {
        console.log(chalk.red('Failed to open serial port: ' + error));
      } else {
        console.log(chalk.green('Opened serial port. . . \nRunning tests. . . \n'));

        resetApp();

        serialPort.on('data', function(data) {
          if (mRecordSerial) {
            // console.reset();
            // console.log(chalk.green("----------------------------------- START --------------------------------"));
            mSerialRecording += data.replace(/\r?\n|\r/g, "\n");
            // console.log(mSerialRecording);
          }

          if (mAssertListen) {
            if (mRecordSerial) {

              // We check the serial print and look for our assertion
              if (mSerialRecording.includes(mAssert)) {
                assertResult('pass');
                mSerialRecording = '';
                mRecordSerial = false;
              }
            } else {
              if (data.includes(mAssert)) {
                assertResult('pass');
                mSerialRecording = '';
                mRecordSerial = false;
              }
            }
          }
        });
      }
    });
  }

  function testDone(result) {
    if (result == 'pass')
      console.log(chalk.yellow(mTestInst.getName()) + " completed with result: " + chalk.green(result) + "\n");
    else {
      console.log(chalk.yellow(mTestInst.getName()) + " completed with result: " + chalk.red(result) + "\n");
    }
    mCurrTest++;
    if (mCurrTest < testObjects.length) {
      resetApp();
    } else {
      console.log(chalk.green("All tests completed!"));
      reportResults();
    }
  }

  function reportResults() {
    console.log("\n\n|---------------- RESULTS ---------------|");
    var prettyTable = [];
    for (var t in mTests) {
      var reportingTest = mTests[t];

      if (reportingTest.mResult == 'pass')
        prettyTable.push([chalk.yellow(reportingTest.mName) + ": ", chalk.green.bold(reportingTest.mResult)]);
      else
        prettyTable.push([chalk.yellow(reportingTest.mName) + ": ", chalk.red.bold(reportingTest.mResult)]);

      for (var i in reportingTest.mInstructions) {
        var reportingInstruction = reportingTest.mInstructions[i];

        if (reportingInstruction.result == 'pass')
          prettyTable.push(['\t' + "- " + reportingInstruction.name, chalk.green(reportingInstruction.result)]);
        else
          prettyTable.push(['\t' + "- " + reportingInstruction.name, chalk.red(reportingInstruction.result)]);
      }
    }
    console.log(table(prettyTable));

    console.log("Exiting...");
    process.exit();
  }

  /* This doesn't actually do anything yet */
  function resetApp() {
    runTest();
  }

  function runTest() {
    mTestInst = AlpineTest(testObjects[mCurrTest]);
    mTests.push(mTestInst);

    console.log("Running test " + (mCurrTest + 1) + " of " + testObjects.length + ": " + chalk.yellow(mTestInst.getName()));

    mTestInst.run(executeCommand, listenForAssert, testDone);
  }

  function executeCommand(command, timeout) {
    mRecordSerial = true;
    if(!mCommandTimeout){
      mCommandTimeout = setTimeout(commandTimeout, timeout);
      console.log("\t\t" + prettyDate() + " ~ Executing command: " + chalk.yellow(JSON.stringify(command)));
      mSocket.emit(command[0], command[1]);
    }
  }

  function commandResult(result) {
    if (result.timestamp <= (mTimestamp + 30)) {
      // console.log(chalk.red("Bullshit response received: " + result.timestamp));
      // return;
    }

    mTimestamp = result.timestamp;

    if (result.result == 'pass') {
      console.log("\t\t" + prettyDate() + " ~ Command got result: " + chalk.green(result.result));

      // Pass sent back a camera code, reassign mCamCode to this code.
      if (result.p) mCamCode = result.p;
      console.log(mAssert);

    } else {
      console.log("\t\t" + prettyDate() + " ~ Command got result: " + chalk.red(result.result));
    }
    clearTimeout(mCommandTimeout);
    mCommandTimeout = undefined;
    mTestInst.onCommandDone(result.result);
  }

  function commandTimeout() {
    console.log("\t\t" + prettyDate() + " ~ Command timed out: " + chalk.red("fail"));
    mCommandTimeout = undefined;
    mTestInst.onCommandDone('fail');
  }

  function assertResult(result) {
    if (result == 'pass')
      console.log("\t\t" + prettyDate() + " ~ Assert got result: " + chalk.green(result));
    else {
      console.log("\t\t" + prettyDate() + " ~ Assert got result: " + chalk.red(result));
    }
    clearAssert();
    mTestInst.onAssertDone(result);
  }

  function assertTimeout() {
    console.log("\t\t" + prettyDate() + " ~ Assert timed out: " + chalk.red("fail"));
    // console.log(mSerialRecording);
    var recording = (' ' + mSerialRecording).slice(1);
    fs.writeFile("/tmp/serialLog", recording, function(status){
      if(status){
        return console.log(status);
      }
      console.log("Dumped serial to /tmp/serialLog");
    })
    clearAssert();
    mTestInst.onAssertDone('fail');
  }

  function listenForAssert(assert, timeout) {
    // If we get passed back a camera setting code, then use that for assertion
    if (mCamCode) {
      console.log(mCamCode);
      mAssert = mCamCode.toLowerCase();
      mCamCode = 0;
    } else {
      mAssert = assert;
    }
    console.log("\t\t" + prettyDate() + " ~ Listening for assertion: " + chalk.yellow(mAssert));
    mAssertListen = true;
    mAssertTimeout = setTimeout(assertTimeout, timeout);
  }

  function clearAssert() {
    mAssert = '';
    mAssertListen = false;
    mSerialRecording = '';
    mRecordSerial = false;
    clearTimeout(mAssertTimeout);
  }

  // ********************************************************************************
  // * Utilitarian Helpers

  function prettyDate() {
    var theTimeIsNow = new Date(Date.now());
    var hors = theTimeIsNow.getHours();
    var mens = theTimeIsNow.getMinutes();
    var sex = theTimeIsNow.getSeconds();
    return hors + ":" + mens + ":" + sex;
  }


}

testServer(process.argv[2], process.argv[3]);
