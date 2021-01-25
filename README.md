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

➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/secrets.yaml -p SSO_CLIENT_SECRET=$(pbpaste)| oc create -f -
secret/minio-creds created
secret/sso-creds created

➜  mobile-signing-service git:(master) ✗ oc process -f openshift/templates/postgres-prerequisite.yaml| oc create -f -
secret/registry-patroni-creds created
serviceaccount/registry-patroni created
role.rbac.authorization.k8s.io/registry-patroni created
rolebinding.rbac.authorization.k8s.io/registry-patroni created