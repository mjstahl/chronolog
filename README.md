# Chronolog

## Development

```sh
$ twilio phone-numbers:update "<receive number>" --sms-url="http://localhost:3000/posts"

$ TWILIO_SID=<twilio sid> \
TWILIO_TOKEN=<twilio token> \
GITHUB_TOKEN=<github token> \
PORT=3000 \
FROM=<send number>\
npm start
```

After these two processes are running. Send texts to the `<receive number>` from the `<send number>`.