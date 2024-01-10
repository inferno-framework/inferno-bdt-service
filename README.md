# BDT HTTP Service Wrapper

A service wrapper for the [Bulk Data Test tool (BDT)](https://github.com/smart-on-fhir/bdt) Node.js module
that enables BDT test orchestration and reporting functionality within [Inferno](https://github.com/onc-healthit/inferno).

## Running Natively

```
npm install
npm start
```

## Running with Docker
```
docker build -t bdt .
docker run -p 4500:4500 bdt
```

## Accessing the API
```
# Returns metadata about all Bulk Data Tests
GET http://localhost:4500/api/tests

# Run a single tests or group of tests
POST http://localhost:4500/api/tests
PAYLOAD: {path: '5.0', settings: {//settings}}
```

This API should be consistent with the currently unpublished BDT web application.
See [BDT Sample App](https://github.com/smart-on-fhir/bdt-sample-app/) for an example
client app to execute against this wrapped API.

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
```
http://www.apache.org/licenses/LICENSE-2.0
```
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
