# Exec

Helper script for running commands on multiple repositories or folders at once. You can also it to compose your own scripts. Also, I recommend using this repo to test scripts that involve deletion operations.

## Install

1. Clone this repository
2. Clone plugins into plugins folder with `npm run install-plugins`
3. Run npm install

## API

| Argument    | Required | Default      | Description                                    | Example               |
| ----------- | -------- | ------------ | ---------------------------------------------- | --------------------- |
| `--cmd`     | Yes      | Empty string | The command(s) to run                          | `--cmd='git status'`  |
| `--dir`     | No       | Project root | The directory where command(s) <br> will run   | `--dir='src/plugins'` |
| `--subdirs` | No       | False        | Runs the command(s) in all <br> subdirectories | `--subdirs`           |
| `--silent`  | No       | False        | Suppresses command(s) output                   | `--silent`            |

## Examples

### Basic: Script for checking the git status of all repositories in a monorepo (this repo)

```json
"scripts": {
  "check-repo-status": "node scripts/exec.js --cmd='git status' && node scripts/exec.js --cmd='git status' --dir='src/plugins' --subdirs"
}
```

And then use with `npm run check-git-status`

TIP: Notice how we don't use the `--dir` param in the first exec.js call, it's because the default value of dir is already project root. Check [API](https://github.com/Lambdaphile/exec#api) section for more details.

### Intermediate: Script for resetting dev branch with the help of double ampersand (`&&`) operator

```json
"scripts": {
  "reset-dev": "node scripts/exec.js --cmd='git checkout main && git push origin -d dev && git branch -D dev && git pull origin main && git checkout -b dev && git push origin dev' & node scripts/exec.js --cmd='git checkout main && git push origin -d dev && git branch -D dev && git pull origin main && git checkout -b dev && git push origin dev' --dir='src/plugins' --subdirs"
}
```

And then use with `npm run reset-dev`

Clarification:

- The double ampersand (&&) operator is used to execute the next command only if the preceding command is successful. This helps ensure that the script halts if there is an issue, allowing you to identify and fix the problematic area before running it again.
- `git push origin -d dev` deletes the dev branch from remote repository
- `git branch -D dev` deletes the local dev branch

### Advanced: Making reset-dev dynamic with the help of `npm_config` variable

```json
"scripts": {
  "reset-branch": "node scripts/exec.js --cmd=\"git checkout main && git push origin -d $npm_config_branch && git branch -D $npm_config_branch && git pull origin main && git checkout -b $npm_config_branch && git push origin $npm_config_branch\" && node scripts/exec.js --cmd=\"git checkout main && git push origin -d $npm_config_branch && git branch -D $npm_config_branch && git pull origin main && git checkout -b $npm_config_branch && git push origin $npm_config_branch\" --dir='src/plugins' --subdirs"
}
```

And then run with `npm run reset-branch --branch=<branch-name>`. For example `npm run reset-branch --branch='dev'` or `npm run reset-branch --branch='demo'`

Clarification:

- There we make the reset-dev script dynamic with the help of `$npm_config` variable which can be used as placeholder in NPM scripts.
- When you're using the `$npm_config` variable, like in this example with `$npm_config_cmd`, make sure to use escaped double quotes (`\"`) instead of single quotes ('). Otherwise, you might run into problems.

### Bonus: Create a helper script to help you run `node scripts/exec.js` (I've already added this)

```json
"scripts": {
  "exec-repo": "node scripts/exec.js --cmd=\"$npm_config_cm\" && node scripts/exec.js --cmd=\"$npm_config_cmd\" --dir='src/plugins --subdirs"
}
```

And with the help of this script you can do two things:

1. Define new project wide scripts easier, like `"script-name": "npm run -s exec-repo --cmd='git status'`, instead of <br>
   `node scripts/exec --cmd='git status' && node scripts/exec --cmd='git status' --dir='src/plugins' --subdirs`
2. Execute project wide commands on the fly with `npm run exec-repo --cmd='git status'` from the terminal

## Good to Know

### Command operators

Knowing these can be helpful while composing commands

- **Semicolon (`;`):** The semicolon operator here allows you to execute multiple commands sequentially on a single line. Each command is executed regardless of the success or failure of the preceding command. For example:

  ```
  command1 ; command2 ; command3
  ```

- **Pipe (`|`):** The pipe operator connects the output of one command as input to another command, allowing you to chain commands together. The output of the preceding command is passed as input to the following command. For example:

  ```
  command1 | command2 | command3
  ```

- **Double Ampersand (`&&`):** The double ampersand operator executes the next command only if the preceding command succeeds (returns an exit code of 0). It is often used for conditional execution of commands. For example:

  ```
  command1 && command2
  ```

- **Double Vertical Bar (`||`):** The double vertical bar operator executes the next command only if the preceding command fails (returns a non-zero exit code). It is used for executing fallback commands or handling errors. For example:

  ```
  command1 || command2
  ```

- **Redirection Operators (`>`, `>>`, `<`):** Redirection operators allow you to redirect input or output from/to files. The greater-than (`>`) operator redirects the output of a command to a file, overwriting the file if it exists. The double greater-than (`>>`) operator appends the output to a file. The less-than (`<`) operator redirects input from a file. For example:

  ```
  command > output.txt
  command >> output.txt
  command < input.txt
  ```

### NPM script operators and helpers

- **Backslash (`\`):** Escape character, can useful when (`'`) is not enough. Example `"script-name": "git commit -m \"$npm_config_m\""`.

- **NPM config env variable (`$npm_config`):** Special environment variable used in npm to store configuration settings and options for npm commands and behavior. In our case it's useful for creating npm scripts with placeholders, like `git checkout $npm_config_branch`.
