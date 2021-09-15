# node-analyser

This is the source code of the [Watnwy](https://watnwy.com) Node analyser service.

The [Watnwy](https://watnwy.com) platform aims at solving problems like how to make sure things remain consistent over time in large codebases with people coming and leaving the team/organization/company quite often, with a technology landscape that evolves at a very fast pace ([more details in our documentation](https://doc.watnwy.com/)). One possible solution is to collaboratively state on **what should [not] be used and why** on an online platform, and to **connect it with your codebase** to make sure things are aligned. The Watnwy analysers are what makes this connection possible.

If you want to track automatically something that is not being tracked at the moment, we welcome every contribution 🙏

This service expects to receive **POST** commands to the endpoint **/analysis** with the JSON payload:

```
{
  "path": "<The path of the project to analyse>"
}
```

The output is a JSON formatted AnalysisEcoSystemResult object which is defined in [src/models.ts](src/models.ts).

## Quick start

### Prerequesites

#### Node

This is a Node service written in Typescript and bundled by rollup.

### Run and call the service

You can try out the service by running and calling it locally. In this case, this is exactly what the [Watnwy](https://watnwy.com) platform does when it analyses your code.

```
# Run the service on localhost:8080
yarn start-dev

# Try it out using httpie
http -v :8080/analysis path=`pwd`

POST /analysis HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Content-Length: 50
Content-Type: application/json
Host: localhost:6000
User-Agent: HTTPie/2.4.0

{
    "path": "/work/node-analyser"
}


HTTP/1.1 200 OK
content-length: 1702
content-type: application/json
date: Thu, 20 May 2021 08:47:12 GMT
server: uvicorn

[
    {
        "name": "node",
        "objects": [
            {
                "name": "express",
                "version": "4.17.1",
                "versions_providers": [
                    {
                        "package_name": "express",
                        "type": "NPMReleases"
                    }
                ]
            },
            ...
        ]
    },
    ...
]
```

## Analyses

For the time being, this analyser gets to detect:
* the Node packages in the `package.json` file. If they are provided, this also uses the files `package-lock.json` and `yarn.lock` to detect the correct package version.

## Contributing

If you want to contribute to this analyser, we can run the tests with:

```
yarn test
```
