{ headers:
signing-api |    { 'Content-Type': 'application/json',
signing-api |      Authorization:
signing-api |       'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5RDIxNGV5aGdoVUt1dThDdDYyREJ2SHd5ekZOZjZ2a1RMaUowcV9OcE5nIn0.eyJqdGkiOiJlMGI1MmZhYy1iZmQxLTQ1OGItOWE0OC0xZGM5ZjAwYjc3Y2IiLCJleHAiOjE1MzkwNjI4MjgsIm5iZiI6MCwiaWF0IjoxNTM5MDYyNTI4LCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZGV2aHViIiwiYXVkIjoic2lnbmluZy1hcGkiLCJzdWIiOiJjYWRiZDg0Ny0xMmZlLTRkZGMtYWM2NC0yMjNlOTJjNWNmZjUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaWduaW5nLWFwaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjUxZWMzNzJmLTRlMDEtNDQyNS05ZjRkLWMwZjFlMTVlOTk3NyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJjbGllbnRJZCI6InNpZ25pbmctYXBpIiwiY2xpZW50SG9zdCI6IjE3Mi41MS4yMC4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LXNpZ25pbmctYXBpIiwiY2xpZW50QWRkcmVzcyI6IjE3Mi41MS4yMC4xIiwiZW1haWwiOiJzZXJ2aWNlLWFjY291bnQtc2lnbmluZy1hcGlAcGxhY2Vob2xkZXIub3JnIn0.ApFX3PljNLi8UPDyLqVt2BYVsrSmwq-ybWuGhLbjhArhxnEg2gkKEnx6ncSe4bPMkTj2L5imarGRHR7be8u69mAK42XYsEUoWku73xspt_SdCd0lzMZTQyMqaEu6l7kBRrIvhPipyeYV78-DiuwGWiTUaEENIRteBPFpbJsWEgGY75C6h4fnHenFqzYLl3454PvYP-mnfKXzq8YWkKJ7DOlcvGH1w2DSe_8FXdYtytz0iGPuZTpeJZ5HT5k2AhRXKHWdJH15-SGqiLBFefNoe0tgyFvwqvk8MCHI9aXTSuFJamYCU1nyfn5pUk1QKUyILbihjB4ahED8qtKrXrJyXg' },
signing-api |   method: 'POST',
signing-api |   uri: 'http://192.168.0.17:8088/v1/job/sign',
signing-api |   body:
signing-api |    { id: 27,
signing-api |      platform: 'android',
signing-api |      originalFileName: 'app-release-unsigned.apk',
signing-api |      originalFileEtag: 'b89ef37680cc130d9662bf0e3606a7e5',
signing-api |      deliveryFileName: null,
signing-api |      deliveryFileEtag: null,
signing-api |      deploymentPlatform: null,
signing-api |      status: 'Created',
signing-api |      projectId: null,
signing-api |      ref: 'http://192.168.0.17:8089/api/v1/job/27' },
signing-api |   json: true }



curl -X POST -i -v -H 'Content-Type: application/json' \


curl -i -v -H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5RDIxNGV5aGdoVUt1dThDdDYyREJ2SHd5ekZOZjZ2a1RMaUowcV9OcE5nIn0.eyJqdGkiOiJlMGI1MmZhYy1iZmQxLTQ1OGItOWE0OC0xZGM5ZjAwYjc3Y2IiLCJleHAiOjE1MzkwNjI4MjgsIm5iZiI6MCwiaWF0IjoxNTM5MDYyNTI4LCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZGV2aHViIiwiYXVkIjoic2lnbmluZy1hcGkiLCJzdWIiOiJjYWRiZDg0Ny0xMmZlLTRkZGMtYWM2NC0yMjNlOTJjNWNmZjUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaWduaW5nLWFwaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjUxZWMzNzJmLTRlMDEtNDQyNS05ZjRkLWMwZjFlMTVlOTk3NyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJjbGllbnRJZCI6InNpZ25pbmctYXBpIiwiY2xpZW50SG9zdCI6IjE3Mi41MS4yMC4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LXNpZ25pbmctYXBpIiwiY2xpZW50QWRkcmVzcyI6IjE3Mi41MS4yMC4xIiwiZW1haWwiOiJzZXJ2aWNlLWFjY291bnQtc2lnbmluZy1hcGlAcGxhY2Vob2xkZXIub3JnIn0.ApFX3PljNLi8UPDyLqVt2BYVsrSmwq-ybWuGhLbjhArhxnEg2gkKEnx6ncSe4bPMkTj2L5imarGRHR7be8u69mAK42XYsEUoWku73xspt_SdCd0lzMZTQyMqaEu6l7kBRrIvhPipyeYV78-DiuwGWiTUaEENIRteBPFpbJsWEgGY75C6h4fnHenFqzYLl3454PvYP-mnfKXzq8YWkKJ7DOlcvGH1w2DSe_8FXdYtytz0iGPuZTpeJZ5HT5k2AhRXKHWdJH15-SGqiLBFefNoe0tgyFvwqvk8MCHI9aXTSuFJamYCU1nyfn5pUk1QKUyILbihjB4ahED8qtKrXrJyXg' \
http://localhost:8088/ehlo

--data '{"id": 27, "platform": "android", "originalFileName": "app-release-unsigned.apk", "originalFileEtag": "b89ef37680cc130d9662bf0e3606a7e5", "deliveryFileName": null, "deliveryFileEtag": null, "deploymentPlatform": null, "status": "Created", "projectId": null, "ref": "http://192.168.0.17:8089/api/v1/job/27"}' \
http://192.168.0.17:8088/v1/job/sign


-data "{'id': 27,'platform': 'android','originalFileName': 'app-release-unsigned.apk','originalFileEtag': 'b89ef37680cc130d9662bf0e3606a7e5','status': 'Created','projectId': null,'ref': '13'}" \
http://192.168.0.17:8088/v1/job/sign


curl -i -v http://localhost:8088/ehlo


id: 27, platform: 'android', originalFileName: 'app-release-unsigned.apk', originalFileEtag: 'b89ef37680cc130d9662bf0e3606a7e5', deliveryFileName: null, deliveryFileEtag: null, deploymentPlatform: null, status: 'Created', projectId: null, ref: 'http://192.168.0.17:8089/api/v1/job/27'



'-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAgEXvVutslQC48+bA0xojbA3Wm7OLlrsPpESpgji5VDhOho00/AyE\nFec4WFiuxdjajNHy+f6aF3I7+hV2lV9HMnNR2zWj83EsLXt5gHXxCyD/g+bz23/l\nENtt7tVaf5W+nqrdIbyLCs9+uA09s8APYmOc2GOrjmUVC9yvJp+PG+jtIypA5nj9\nzZHZ5vm0iDYQ5rjdArMdxfv1Y5m2Cu5KjMVTZVQQBZnOjZ4r5tlprf3YB+TFrV4i\nFgrcqEhM8ZloxbTI69Yzok/rXUvfN4nufKwS1N73kqjcQF7LccoMMf6iU1YQhE76\n7D6p4ZLBv+QBm3lgG/cVBcb1naXYo5WdDwIDAQAB\n-----END RSA PUBLIC KEY-----\n',


'\n-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAs1adod1+laVtsql0olCs4zo/Ng4kJDdwHdzJQW6TlE61MlpskJPu\nlK+OTytOdi/hSSnKPwNsMrzqm60RuR4hnhMJBdrOjbBnr6yUKSIAv6SPXK0QrmN5\nY0XuhV4kMkDJ0aN15UxRzSGdeaXAetmQEqSl/+lt33mTNsTfU6kzgKkwyZQSbITm\njze8MVVtjfdly0DsMt/1tc6l+tUvaDzGgqUEF5dAUFq2MgdH7FM6quHml3ze3F8z\nPmk6ia8tHZ4wJULOFiLvKuRNU8ZsPMuwyFPYtF+/b4HgVCco82EP51psNOXpq4YH\n3qjAgJjYw3Oe1ULU+xdzXWXhzSq6WWxBAQIDAQAB\n-----END RSA PUBLIC KEY-----',



{ jwtFromRequest: [Function],
  algorithms: [ 'RS256' ],
  secretOrKey:
   '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAs1adod1+laVtsql0olCs4zo/Ng4kJDdwHdzJQW6TlE61MlpskJPu\nlK+OTytOdi/hSSnKPwNsMrzqm60RuR4hnhMJBdrOjbBnr6yUKSIAv6SPXK0QrmN5\nY0XuhV4kMkDJ0aN15UxRzSGdeaXAetmQEqSl/+lt33mTNsTfU6kzgKkwyZQSbITm\njze8MVVtjfdly0DsMt/1tc6l+tUvaDzGgqUEF5dAUFq2MgdH7FM6quHml3ze3F8z\nPmk6ia8tHZ4wJULOFiLvKuRNU8ZsPMuwyFPYtF+/b4HgVCco82EP51psNOXpq4YH\n3qjAgJjYw3Oe1ULU+xdzXWXhzSq6WWxBAQIDAQAB\n-----END RSA PUBLIC KEY-----',
  passReqToCallback: true,
  ignoreExpiration: true }



  { jwtFromRequest: [Function],
    algorithms: [ 'RS256' ],
    secretOrKey:
     '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAgEXvVutslQC48+bA0xojbA3Wm7OLlrsPpESpgji5VDhOho00/AyE\nFec4WFiuxdjajNHy+f6aF3I7+hV2lV9HMnNR2zWj83EsLXt5gHXxCyD/g+bz23/l\nENtt7tVaf5W+nqrdIbyLCs9+uA09s8APYmOc2GOrjmUVC9yvJp+PG+jtIypA5nj9\nzZHZ5vm0iDYQ5rjdArMdxfv1Y5m2Cu5KjMVTZVQQBZnOjZ4r5tlprf3YB+TFrV4i\nFgrcqEhM8ZloxbTI69Yzok/rXUvfN4nufKwS1N73kqjcQF7LccoMMf6iU1YQhE76\n7D6p4ZLBv+QBm3lgG/cVBcb1naXYo5WdDwIDAQAB\n-----END RSA PUBLIC KEY-----\n',
    passReqToCallback: true,
    ignoreExpiration: true }



    //debug!
    app.use(passport.authenticate('jwt', { session: false }, (error, user, info) => {
      console.log('error = ', error, ' info = ', info, '  user = ', user);
    }));