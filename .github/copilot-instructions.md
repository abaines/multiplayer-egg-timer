# Copilot Instructions for This Repository

## Coding Style
- Make types explicit for variables, parameters, and return values wherever the language supports them.
  Prefer explicit type annotations over inference.
  If inference is unavoidable, ensure the type is obvious from the right-hand side and intent is unambiguous.
- Treat all variables as immutable where feasible.
  Prefer single-assignment locals and avoid reassignment for clarity and maintainability.
- Use descriptive, self-documenting names for functions, methods, classes, and variables.
  Favor clarity over brevity in naming.
- When writing Markdown, break long sentences across multiple lines for easier diffs and reviews.
  Do not add two spaces at the end of a line unless you want a line break in rendered output.
  This will render as a single paragraph in Markdown preview, but makes version control diffs easier to read.

## General Guidelines
- Prefer clarity and maintainability over brevity.
- Follow DRY (Don't Repeat Yourself): extract common patterns into reusable functions, methods, or constants.
- Prefer explicit behavior over implicit or automatic behavior.
  Make control flow, resource lifetimes, and side effects visible and intentional.
- Avoid explanatory comments where good naming can make intent clear.
  Use self-documenting code; rely on comments only when necessary for non-obvious context.
- Use offensive (fail-fast) programming: fail immediately and loudly if an assumption is violated,
  rather than attempting recovery or silent fallback.
- Handle unexpected values explicitly.
  Include a default or else-case that fails fast (e.g., by throwing an exception or asserting),
  to avoid silent failures.

## Validation, Nullability, and Assertions
- Validate assumptions with explicit, separate checks.
  Use one assertion per condition to produce specific, actionable error messages.
  For example, check non-null and validity with distinct assertions rather than compound conditions.
- Prefer the most specific type possible, including explicit nullability where the language supports it.
  Annotate nullability and handle null explicitly with clear control flow and error handling.
- Use the project's assertion facilities or the language’s standard tools
  (e.g., Assert/Debug.Assert/contract checks) to catch logic errors early.
- Throw explicit errors for unexpected states and inputs.
  Do not rely on implicit defaults or silent coercions.

## Immutability and Constants
- Favor immutable data structures and patterns.
  Use compile-time constants for fixed values and explicit runtime constants for values determined at startup.
- Clearly distinguish between mutable and immutable state.
  Encapsulate mutation behind well-defined interfaces where necessary.

## Resource Management and Error Handling
- Manage resources explicitly.
  Ensure clear ownership, lifetime, and disposal/cleanup semantics using language-appropriate constructs
  (e.g., RAII, with/using blocks, or explicit try-finally).
- Handle errors intentionally with clear control flow.
  Avoid hidden side effects and implicit recoveries that obscure failure modes.

## AI/Assistant Behavior
- Always follow these instructions for all code suggestions and edits.
- Proactively address potential parser or compiler warnings and errors.
- If unsure about a type, prefer the most specific explicit type or annotation available.
- Respect nullability and contract annotations.
- Choose designs that maximize clarity, maintainability, and explicitness.

---

_This file is used by GitHub Copilot and compatible AI assistants to ensure consistent code quality and style._

