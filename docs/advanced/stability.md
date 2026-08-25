# Stability and beta releases

The SDK is in beta. It covers every current public MCSR Ranked API endpoint,
but its TypeScript-facing design is still settling.

## What works today

- Every documented public API endpoint has a resource method.
- Requests have timeouts, retry handling, response errors, and runtime shape
  checks.
- Public methods return TypeScript types for their results and options.

## What may change before 1.0

Some return types may become more precise as beta testing reveals which API
fields are optional, nullable, or limited to certain match variants. Method
options and exported type names may also change to provide better autocomplete.

The current `RankedError` API is temporary. Error codes and `details` may
change before the stable release.

These changes should improve editor help and make invalid states harder to
represent. They can still require updates in applications that depend on the
beta types.

## Use the beta safely

- Pin the SDK version in applications where unexpected type changes would
  block a deployment.
- Read the release notes before upgrading.
- Keep error handling focused on the few cases your interface needs.
- Report API responses that trigger validation warnings.

The package version remains below 1.0 while these contracts can change. Check
the [GitHub releases](https://github.com/Notava1ble/mcsrranked-sdk/releases)
before upgrading a production application.
