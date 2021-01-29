<!-- ![Test & Build](https://github.com/bcgov/platform-services-registry/workflows/Test%20&%20Build/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/maintainability)](https://codeclimate.com/github/bcgov/platform-services-registry/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/test_coverage)](https://codeclimate.com/github/bcgov/platform-services-registry/test_coverage)
 -->

# Mobile Signing Service
Under Construction

IN TOOLS

10330  oc process -f openshift/templates/cicd.yaml -p NAMESPACE=$(oc project --short)| oc apply -f -

10331  oc process -f openshift/templates/nsp-tools.yaml -p NAMESPACE=$(oc project --short)| oc apply -f -

IN dev/test/prod

➜  mobile-signing-service git:(master) ✗ oc create secret docker-registry artifactory-creds --docker-server=docker-remote.artifacts.developer.gov.bc.ca --docker-username=$(oc get secret/artifacts-default-jsekyu -o json -n 22e0ba-tools | jq ".data.username"| tr -d "\"" | base64 -d) --docker-password=$(oc get secret/artifacts-default-jsekyu -o json -n 22e0ba-tools | jq ".data.password"| tr -d "\"" | base64 -d) --docker-email=unused
secret/artifactory-creds created


➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/secrets.yaml -p SSO_CLIENT_SECRET=$(pbpaste)| oc create -f -
secret/minio-creds created
secret/sso-creds created

➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/patroni-prerequisite.yaml| oc apply -f -
secret/patroni-creds created
serviceaccount/patroni created
role.rbac.authorization.k8s.io/patroni created
rolebinding.rbac.authorization.k8s.io/patroni created

➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/patroni-deploy.yaml --param-file=./openshift/patroni-prod.properties -p NAMESPACE=$(oc project --short) | oc apply -f -

networksecuritypolicy.security.devops.gov.bc.ca/db-to-db created
configmap/patroni-env created
service/patroni created
statefulset.apps/patroni created

➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/app-deploy.yaml --param-file=./openshift/app-prod.properties -p NAMESPACE=$(oc project --short) -p TLS_CERT_PEM="$(cat ./openshift/certificate.pem)" -p TLS_KEY_PEM="$(cat ./openshift/key.pem)" -p TLS_CACERT_PEM="$(cat ./openshift/ca.pem)" -p AGENT_HOST="142.23.62.72" | oc apply -f -
externalnetwork.security.devops.gov.bc.ca/all-things-external created
networksecuritypolicy.security.devops.gov.bc.ca/web-to-api created
networksecuritypolicy.security.devops.gov.bc.ca/api-to-db created
networksecuritypolicy.security.devops.gov.bc.ca/api-to-mino created
networksecuritypolicy.security.devops.gov.bc.ca/api-to-external created
configmap/web-caddy-config created
configmap/web-env created
configmap/api-env created
configmap/minio-env created
persistentvolumeclaim/minio-data created
deploymentconfig.apps.openshift.io/web created
deploymentconfig.apps.openshift.io/minio created
deploymentconfig.apps.openshift.io/api created
service/web created
service/api created
service/minio created
route.route.openshift.io/web created
route.route.openshift.io/api created