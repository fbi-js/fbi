# Contribute Guide

## Pull Request Guidelines

- Checkout a topic branch from `main` branch, and merge back against that branch.
- Work in the `src` and `templates` folders.
- Use [fbi commit](https://github.com/fbi-js/factory-commands/blob/main/src/commands/commit/README.md) to commit your code.

    ```bash
    # install
    npx fbi add factory-commands
    # usage
    npx fbi commit
    ```

## Development

- Setup

   ```bash
   yarn
   ```

- Start development

   ```bash
   yarn dev
   ```

## Project Structure

- `src`
  - `commands`: All builtIn commands.
  - `core`: Core modules.
  - `cli.ts`: Command-line entry file.
  - `fbi.ts`: Main module file.

