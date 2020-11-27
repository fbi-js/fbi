# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.2.1](https://github.com/fbi-js/fbi/compare/v4.2.0...v4.2.1) (2020-11-27)


### Bug Fixes

* **version:** reset git repository after version initialized ([038ff3c](https://github.com/fbi-js/fbi/commit/038ff3c0e62a7735e38b24296dbb6e1f3eca785b))

## [4.2.0](https://github.com/fbi-js/fbi/compare/v4.1.13...v4.2.0) (2020-11-27)


### Bug Fixes

* **factory:** split factories by organization name ([0486143](https://github.com/fbi-js/fbi/commit/04861439a417fc6699051db657178e5adbca70d3))

### [4.1.13](https://github.com/fbi-js/fbi/compare/v4.1.12...v4.1.13) (2020-11-26)


### Bug Fixes

* ignore tmp dir ([7c346d1](https://github.com/fbi-js/fbi/commit/7c346d1d5760bc2e25429a5c91e53ccce8b4161c))

### [4.1.12](https://github.com/fbi-js/fbi/compare/v4.1.11...v4.1.12) (2020-11-26)


### Bug Fixes

* **version:** update code even if version dir exist ([bca9c9a](https://github.com/fbi-js/fbi/commit/bca9c9a976dfed40023d46e7faad85adcc152e2f))

### [4.1.11](https://github.com/fbi-js/fbi/compare/v4.1.10...v4.1.11) (2020-11-26)


### Bug Fixes

* fix npm v7 install error; resolve factory versions with prerelease versions ([353508e](https://github.com/fbi-js/fbi/commit/353508e1f5b488f5b2dd582d6ce1795a39a7d564))

### [4.1.10](https://github.com/fbi-js/fbi/compare/v4.1.9...v4.1.10) (2020-11-25)


### Bug Fixes

* **factory:** resolveFromLocal ([3628b51](https://github.com/fbi-js/fbi/commit/3628b519634504c75175f3ebccc2785edf1f5415))

### [4.1.9](https://github.com/fbi-js/fbi/compare/v4.1.8...v4.1.9) (2020-11-24)


### Bug Fixes

* **factory:** increase priority of local node_modules ([be4a4ee](https://github.com/fbi-js/fbi/commit/be4a4ee4a0ab45d1d3513f985bafbfa429f4c84e))

### [4.1.8](https://github.com/fbi-js/fbi/compare/v4.1.7...v4.1.8) (2020-10-16)


### Bug Fixes

* **utils:** fix git command issues ([ce33b22](https://github.com/fbi-js/fbi/commit/ce33b22d29e151c5eee161628672d3e6bcf8fe85))

### [4.1.7](https://github.com/fbi-js/fbi/compare/v4.1.6...v4.1.7) (2020-10-14)


### Bug Fixes

* **create:** can not find template name ([5cad77c](https://github.com/fbi-js/fbi/commit/5cad77c6c5d6f867a1274a576bbf20c89d4be5a6))

### [4.1.6](https://github.com/fbi-js/fbi/compare/v4.1.5...v4.1.6) (2020-10-13)


### Bug Fixes

* move 'installDeps' to BaseClass ([71c37d1](https://github.com/fbi-js/fbi/commit/71c37d1ee71f2cc9f21ec16c2d0d29672b2ad995))

### [4.1.5](https://github.com/fbi-js/fbi/compare/v4.1.4...v4.1.5) (2020-10-13)


### Bug Fixes

* add 'installDeps' method to template class ([f1f56a8](https://github.com/fbi-js/fbi/commit/f1f56a83e38df1f0fa3649cabc9ec79756f6a7ca))

### [4.1.4](https://github.com/fbi-js/fbi/compare/v4.1.3...v4.1.4) (2020-10-13)


### Bug Fixes

* edge case compatibility ([06bc029](https://github.com/fbi-js/fbi/commit/06bc0294ff4ff72d9e4cbd5b2f09601da4aeb8c8))

### [4.1.3](https://github.com/fbi-js/fbi/compare/v4.1.2...v4.1.3) (2020-10-13)


### Bug Fixes

* **list:** fix error when factory is null ([a49c830](https://github.com/fbi-js/fbi/commit/a49c830d3842e287767208d75cd5546ad92842c2))

### [4.1.2](https://github.com/fbi-js/fbi/compare/v4.1.1...v4.1.2) (2020-10-13)


### Bug Fixes

* **package:** upgrade tslib version ([436480e](https://github.com/fbi-js/fbi/commit/436480e721d3ccd1c487dfe9aaea6f19c7428a84))

### [4.1.1](https://github.com/fbi-js/fbi/compare/v4.1.0...v4.1.1) (2020-10-13)


### Bug Fixes

* **command:** 'create' command optimization ([eb3e660](https://github.com/fbi-js/fbi/commit/eb3e660d391394e59902daa763bc8d9527ac22fc))
* **command:** format input name when adding factory ([c019085](https://github.com/fbi-js/fbi/commit/c01908544b5e67cb383e79987e0cb456de7b88a4))
* **command:** list command not showing the correct 'from path' of a factory ([b3bf4da](https://github.com/fbi-js/fbi/commit/b3bf4daf99c691c8171cdca94b3c62121b25d1e9))

## [4.1.0](https://github.com/fbi-js/fbi/compare/v4.0.4...v4.1.0) (2020-09-30)


### Features

* some new features ([5c169d6](https://github.com/fbi-js/fbi/commit/5c169d65029cce912d4d34373bfcbbdcec14d251))
* **create:** pick an action when current directory is not empty ([144e4ff](https://github.com/fbi-js/fbi/commit/144e4ffeea4593785ba088cd944165adc0c51161))


### Bug Fixes

* **git:** support multi-line messages in 'git commit' ([ee902c7](https://github.com/fbi-js/fbi/commit/ee902c7a8a7edc01f8896dfa58fa467ee79645d7))

### [4.0.4](https://github.com/fbi-js/fbi/compare/v4.0.3...v4.0.4) (2020-09-21)


### Bug Fixes

* set allowUnknownOption=true for factory's commands ([b22e423](https://github.com/fbi-js/fbi/commit/b22e4239ea31dac545095738b515ed95a4a7827e))

### [4.0.3](https://github.com/fbi-js/fbi/compare/v4.0.2...v4.0.3) (2020-09-20)


### Bug Fixes

* change npm first ([9725f6f](https://github.com/fbi-js/fbi/commit/9725f6fba35d0d005369647f36142daa47bb3f59))

### [3.3.2](https://github.com/fbi-js/fbi/compare/v4.0.0-next.6...v3.3.2) (2020-09-11)

### [3.3.1](https://github.com/fbi-js/fbi/compare/v4.0.0-next.1...v3.3.1) (2020-05-08)


### Bug Fixes

* style.grey is not a function ([32a2df5](https://github.com/fbi-js/fbi/commit/32a2df594f5de9f110b3b0a008ef82fa03788086))

### [4.0.2](https://github.com/fbi-js/fbi/compare/v4.0.1...v4.0.2) (2020-09-17)

### [4.0.1](https://github.com/fbi-js/fbi/compare/v4.0.0...v4.0.1) (2020-09-17)

## [4.0.0](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.9...v4.0.0) (2020-09-17)

## [4.0.0-alpha.9](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.8...v4.0.0-alpha.9) (2020-09-16)


### Features

* **version:** support "main" as default branch ([0c1bcf6](https://github.com/fbi-js/fbi/commit/0c1bcf6824d36f44661eb3a7acca1abc4958f2e5))

## [4.0.0-alpha.8](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.7...v4.0.0-alpha.8) (2020-09-15)


### Bug Fixes

* load config in factory's constructor ([160adc2](https://github.com/fbi-js/fbi/commit/160adc2e7e819cabe2fea5c5f51ed8ccab9d1f77))

## [4.0.0-alpha.7](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2020-09-15)


### Bug Fixes

* load config before factory init ([11e08b6](https://github.com/fbi-js/fbi/commit/11e08b6e7776eb5893f1715b10e4c1e7ca3257dd))

## [4.0.0-alpha.6](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.5...v4.0.0-alpha.6) (2020-09-15)


### Bug Fixes

* get latest tag error when no tag exist ([fa2c578](https://github.com/fbi-js/fbi/commit/fa2c578b4fce46713d59c9d93d262e5f3bfcb0ec))

## [4.0.0-alpha.5](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.4...v4.0.0-alpha.5) (2020-09-15)

## [4.0.0-alpha.4](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2020-09-14)


### Bug Fixes

* support adding global factories ([ac23c66](https://github.com/fbi-js/fbi/commit/ac23c6673e94464de8d44ee47c515d63896414d8))

## [4.0.0-alpha.3](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2020-09-14)

## [4.0.0-alpha.2](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.1...v4.0.0-alpha.2) (2020-09-14)

## [4.0.0-alpha.1](https://github.com/fbi-js/fbi/compare/v4.0.0-alpha.0...v4.0.0-alpha.1) (2020-09-14)

## [4.0.0-alpha.0](https://github.com/fbi-js/fbi/compare/v4.0.0-next.6...v4.0.0-alpha.0) (2020-09-14)


### Bug Fixes

* always resolve gobal factories ([084389c](https://github.com/fbi-js/fbi/commit/084389c8beacce8546df35bc305fd1af58982319))
