import * as v from "valibot";

import { RankedError } from "./errors.js";

export type ValidationPolicy = "ignore" | "warn" | "error";

export interface ValidationProblem {
  readonly path: string | null;
  readonly message: string;
}

export interface ValidationIssue {
  readonly route: string;
  readonly url: string;
  readonly problems: readonly ValidationProblem[];
}

export interface ValidationOptions {
  readonly policy?: ValidationPolicy;
  readonly onIssue?: (issue: ValidationIssue) => void;
}

export type ValidationConfiguration = ValidationPolicy | ValidationOptions;

interface ValidationContext {
  readonly route: string;
  readonly url: string;
}

export interface ResponseValidator {
  validate<TOutput>(
    schema: v.GenericSchema<unknown, TOutput>,
    data: unknown,
    context: ValidationContext,
  ): TOutput;
}

function resolveOptions(configuration: ValidationConfiguration | undefined): {
  readonly policy: ValidationPolicy;
  readonly onIssue: ValidationOptions["onIssue"];
} {
  if (typeof configuration === "string") {
    return { policy: configuration, onIssue: undefined };
  }

  return {
    policy: configuration?.policy ?? "warn",
    onIssue: configuration?.onIssue,
  };
}

function toValidationIssue(
  context: ValidationContext,
  issues: readonly v.BaseIssue<unknown>[],
): ValidationIssue {
  return {
    ...context,
    problems: issues.map((issue) => ({
      path: v.getDotPath(issue),
      message: issue.message,
    })),
  };
}

function reportIssue(
  policy: Exclude<ValidationPolicy, "ignore">,
  issue: ValidationIssue,
  onIssue: ValidationOptions["onIssue"],
): void {
  if (onIssue === undefined) {
    const message = `MCSR Ranked response validation failed for ${issue.route}`;

    if (policy === "warn") {
      console.warn(message, issue);
    } else {
      console.error(message, issue);
    }
    return;
  }

  try {
    onIssue(issue);
  } catch (cause) {
    console.error("MCSR Ranked validation onIssue callback failed", cause);
  }
}

export function createResponseValidator(
  configuration?: ValidationConfiguration,
): ResponseValidator {
  const { policy, onIssue } = resolveOptions(configuration);

  return {
    validate<TOutput>(
      schema: v.GenericSchema<unknown, TOutput>,
      data: unknown,
      context: ValidationContext,
    ): TOutput {
      if (policy === "ignore") {
        return data as TOutput;
      }

      const result = v.safeParse(schema, data);

      if (result.success) {
        return data as TOutput;
      }

      const issue = toValidationIssue(context, result.issues);
      reportIssue(policy, issue, onIssue);

      if (policy === "error") {
        throw new RankedError(
          `MCSR Ranked returned an invalid response for ${context.route}`,
          {
            code: "INVALID_RESPONSE",
            details: issue,
          },
        );
      }

      return data as TOutput;
    },
  };
}
