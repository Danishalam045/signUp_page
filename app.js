const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

app.use(express.static("files"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

const apiKey = "79ea13e8da45e9ca91c484b49f02c127-us13";
const audienceId = "89e2035bfd";
const serverPrefix = "us13";

app.post("/", (req, res) => {
  console.log(req.body);
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = JSON.stringify({
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
    },
  });

  const options = {
    hostname: `${serverPrefix}.api.mailchimp.com`,
    path: `/3.0/lists/${audienceId}/members/`,
    method: "POST",
    headers: {
      Authorization: `apikey ${apiKey}`,
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const request = https.request(options, (response) => {
    let responseData = "";

    console.log(response.statusCode);
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", (chunk) => {
      responseData += chunk;
    });

    response.on("end", () => {
      console.log(JSON.parse(responseData));
    });
  });

  request.on("error", (e) => {
    console.error(e);
  });

  request.write(data);
  request.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
