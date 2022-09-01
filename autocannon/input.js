const http = require("http");
const autocannon = require("autocannon");
const { getRandomInt } = require("./util");

function createHandler(serverName) {
  return function () {
    console.log(serverName + " received request");
  };
}

const server1 = http.createServer(createHandler("Output testing server"));

server1.listen(0, startBench);

function startBench() {
  autocannon(
    {
      url: "http://localhost:4000",
      connections: 10000,
      duration: 60,
      requests: [
        {
          method: "POST",
          path: "/input",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ number: getRandomInt(1, 10000) }),
          onResponse: (status, body) => {
            console.log(status, body);
          },
        },
      ],
      setupClient: setupClient,
    },
    finishedBench
  );

  function setupClient(client) {
    client.on("response", (statusCode, resBytes, responseTime) => {
      console.log(
        `Got response with code ${statusCode} in ${responseTime} milliseconds ${resBytes.toString()} bytes`
      );

      client.setBody(
        JSON.stringify({
          number: getRandomInt(1, 10000),
        })
      );
    });
  }

  function finishedBench(err, res) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log(res);
    process.exit(1);
  }
}
