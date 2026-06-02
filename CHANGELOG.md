# Changelog

## [1.2.0](https://github.com/voiceyBill/voiceyBill-server/compare/backend-v1.1.0...backend-v1.2.0) (2026-05-29)


### Features

* **/report/resend:** Implement resend report email endpoint with error handling and email data transformation ([71898f6](https://github.com/voiceyBill/voiceyBill-server/commit/71898f67804cdfaa41ec8c2913b9822bb2ee0cee))
* **/report/resend:** Implement resend report email endpoint with error handling and email data transformation. ([365369b](https://github.com/voiceyBill/voiceyBill-server/commit/365369b621c6c5496e5f7d0cd7569b5472b2b3da))
* **backend:** Add unified transactional email template design ([c8f3ec9](https://github.com/voiceyBill/voiceyBill-server/commit/c8f3ec960f8afadfa0c3fe4ae1169be6f9e2cb64))
* **backend:** Implement multi currency support ([a3e741f](https://github.com/voiceyBill/voiceyBill-server/commit/a3e741fd49eafa6ff6d1abff1d354802539e0d6b))
* **backend:** implement multi-currency support ([ee1975c](https://github.com/voiceyBill/voiceyBill-server/commit/ee1975c9c75c9cdebce4d8e7505bc27a0bad5cd8))
* **backend:** unify transactional email template design ([6d7596b](https://github.com/voiceyBill/voiceyBill-server/commit/6d7596b3b70f618b63c320017dfeb54a48f4e573))
* Create budget tracking feature API endpoints ([a6877c5](https://github.com/voiceyBill/voiceyBill-server/commit/a6877c5e059fde1617b5b233a0e2203cb0999972))
* **user:** add change password endpoint for issue [#73](https://github.com/voiceyBill/voiceyBill-server/issues/73) ([62046dc](https://github.com/voiceyBill/voiceyBill-server/commit/62046dcda9faa1c050fc5c80a967e2b9bc41c0ff))
* **user:** Add change password endpoint for issue [#73](https://github.com/voiceyBill/voiceyBill-server/issues/73) ([f05debf](https://github.com/voiceyBill/voiceyBill-server/commit/f05debf1ae36fc7ca41387107884ab1917ccd5c2))


### Bug Fixes

* address copilot review comments ([c39f328](https://github.com/voiceyBill/voiceyBill-server/commit/c39f328c4fb65526c665d634b1eac09d84083098))
* **auth:** Add per-email rate limiting to resend-otp endpoint ([43205f0](https://github.com/voiceyBill/voiceyBill-server/commit/43205f024a64027d53f03c6dec9f039c336dd5ed))
* **auth:** implement refresh token flow ([966c3fc](https://github.com/voiceyBill/voiceyBill-server/commit/966c3fc4c8e435a030c02c911e2f79cca86e1076))
* **auth:** Prevent overwriting unverified accounts ([e94ecd6](https://github.com/voiceyBill/voiceyBill-server/commit/e94ecd61aa266132a2f3712a4fe6e432b459bb6b))
* **auth:** Prevent overwriting unverified accounts ([f9ccea0](https://github.com/voiceyBill/voiceyBill-server/commit/f9ccea0f56ff373586adf2d7ca35c954d5f331c8))
* **auth:** Relax login password validation ([528ae63](https://github.com/voiceyBill/voiceyBill-server/commit/528ae639ab6ea07f1ab03d2ea73f61573869b160))
* **auth:** Relax login password validation ([0e7b9c2](https://github.com/voiceyBill/voiceyBill-server/commit/0e7b9c28e3a40a43dea4e1702cd0f15d7c41247f))
* **backend:** add null check alongside Cloudinary URL validation for SSRF ([fa95538](https://github.com/voiceyBill/voiceyBill-server/commit/fa955383edf20b9223d06b21ed06604cb4e2bf9e))
* **backend:** Add ownership check in delete transaction API ([80b0cb9](https://github.com/voiceyBill/voiceyBill-server/commit/80b0cb90c92b6eab7fe6c21e6444e74fb391fd55))
* **backend:** Add ownership check in delete transaction API ([7e8621f](https://github.com/voiceyBill/voiceyBill-server/commit/7e8621f0101c9defdb40ec9e8517b4151cdd9450))
* **backend:** Clear recurrence fields when disabling recurring transaction ([36f6852](https://github.com/voiceyBill/voiceyBill-server/commit/36f685218a8d60166f9f4a4f69c80c5ca5e40ac1))
* **backend:** Clear recurrence fields when disabling recurring transaction ([80f5026](https://github.com/voiceyBill/voiceyBill-server/commit/80f50265c6544ea764bbd4268dce003bf48140f4))
* **backend:** reconstructed Cloudinary URL from hardcoded origin to break SSRF taint flow ([65f4882](https://github.com/voiceyBill/voiceyBill-server/commit/65f4882e915b0538ea54914287958f2cf1c12463))
* **backend:** remove debug console logs ([52254c8](https://github.com/voiceyBill/voiceyBill-server/commit/52254c81f853b636df221587642219c82c362508))
* **backend:** Remove debug logs ([67d4776](https://github.com/voiceyBill/voiceyBill-server/commit/67d47765dad26123c81632e2810a6e321ce028f1))
* **backend:** remove user input from console log to resolve CodeQL warning ([9077672](https://github.com/voiceyBill/voiceyBill-server/commit/9077672bf688a0c3bdfdf297094fe15d2ceab502))
* **backend:** remove user input from error string to resolve CodeQL warning ([9dff826](https://github.com/voiceyBill/voiceyBill-server/commit/9dff826b8f871de919634f996df186a3a8adbc35))
* **backend:** revert to direct Cloudinary URL for OpenAI vision — removes SSRF vector ([55c6227](https://github.com/voiceyBill/voiceyBill-server/commit/55c6227b6b674d64be81c8f5ce5a9bd32ff06b48))
* **backend:** validate Cloudinary URL before fetch to resolve SSRF warning ([d36e5b6](https://github.com/voiceyBill/voiceyBill-server/commit/d36e5b696bff0db7af6b2641c2d357c776ec37a8))
* **backend:** validate currency codes to prevent format string injection ([5cceede](https://github.com/voiceyBill/voiceyBill-server/commit/5cceede674e188774e2a5d97f3fd9e9aabc7dbb1))
* Correct typo 'Transacton' → 'Transaction' in API response ([c72b0e1](https://github.com/voiceyBill/voiceyBill-server/commit/c72b0e12b9cada16b54bea7bdee3b03a63dfa1c3))
* Enforce password strength validation in auth validator ([b20395e](https://github.com/voiceyBill/voiceyBill-server/commit/b20395e4003ca326576837aaf865c578f6acfe26))
* enforce password strength validation in auth validator and auth forms ([ccd7a6b](https://github.com/voiceyBill/voiceyBill-server/commit/ccd7a6b6d6c51ed0ab232a168cdecb8a8cb9d615))
* Implement refresh token flow ([d6aaa8b](https://github.com/voiceyBill/voiceyBill-server/commit/d6aaa8b8c14eeccebd6413ae6734aad55e7c5e89))
* receipt scan JSON truncation and category mismatch ([2fd5c59](https://github.com/voiceyBill/voiceyBill-server/commit/2fd5c5952bc2cb8e4b288331114bd635a75d6ddd))
* rename transations to transactions in API response ([badb205](https://github.com/voiceyBill/voiceyBill-server/commit/badb205fd9748c60e5a7536dbdd45de014d06e85))
* Rename transations to transactions in API response ([24abd8f](https://github.com/voiceyBill/voiceyBill-server/commit/24abd8fa697fc26e7661e00b3708b503cfa22fa3))
* **report-mail-template:** remove custom property from frequency ([f68da66](https://github.com/voiceyBill/voiceyBill-server/commit/f68da6602935925b4121093a0f021cd1a9bea89d))
* **report-schema:** Report Schema to Store Structured Date Ranges (startDate, endDate) Instead of Parsing period ([8ee3f85](https://github.com/voiceyBill/voiceyBill-server/commit/8ee3f857ef871654140e4a2d839ed9d1ef36c007))
* **report-schema:** Update report schema and add startDate/endDate fields ([20001cc](https://github.com/voiceyBill/voiceyBill-server/commit/20001cc9194b95fd0e024a5ca4e1ab965d27fb4b))
* **report-template:** restore previous report email template with detailed information ([4895fa3](https://github.com/voiceyBill/voiceyBill-server/commit/4895fa3da28c8aa765097c854dff7652ecc46e49))
* revert accidental package file changes ([4bd6ef1](https://github.com/voiceyBill/voiceyBill-server/commit/4bd6ef17e79e1827eb17a889c0445de66a2bef8e))
* **transaction:** add strict pagination validation ([540eeff](https://github.com/voiceyBill/voiceyBill-server/commit/540eeff5fdcc2ac2cf8d4bc3a27c4c8e0dd17ef5))
* **transaction:** Add strict pagination validation ([77633e1](https://github.com/voiceyBill/voiceyBill-server/commit/77633e166547e47507a6cf3cba253801e5f3f11f))

## [1.1.0](https://github.com/voiceyBill/voiceyBill-server/compare/backend-v1.0.0...backend-v1.1.0) (2026-05-11)


### Features

* add ci/cd workflows, issue templates, and governance docs ([d0f2b9a](https://github.com/voiceyBill/voiceyBill-server/commit/d0f2b9aac9a71e98d438ceb9060d8fb9a0c31b92))
* **auth:** Add email verification and password reset flows ([9d0a3c8](https://github.com/voiceyBill/voiceyBill-server/commit/9d0a3c8c2dc8b971e02926e7be66fc71c2c77755))
* **mailer:** redesign report email template to match VoiceyBill brand theme ([fc3d442](https://github.com/voiceyBill/voiceyBill-server/commit/fc3d442bc7eeb253993ef9b2da347678a5774af4))


### Bug Fixes

* **backend:** Resolve Vercel cold-start DB timeouts, fix Resend error handling, and redesign report email template ([0cca0f4](https://github.com/voiceyBill/voiceyBill-server/commit/0cca0f4ecdedd833684e43dd8b6459622450e3ae))
* **ci:** resolve PR check failures on CI and dependency review ([3ac9e7d](https://github.com/voiceyBill/voiceyBill-server/commit/3ac9e7d0f5f6b042c5d72d79de16b5e9dd8d3680))
* **db:** ensure MongoDB connection on all routes and tune serverless config ([c2f5632](https://github.com/voiceyBill/voiceyBill-server/commit/c2f5632053792313eda1aa3545066f7470ed589d))
* **mailer:** throw on Resend API errors instead of silently succeeding ([b32a4c5](https://github.com/voiceyBill/voiceyBill-server/commit/b32a4c550dbe93c9840cbb25cb52629e767507f9))
* update CORS allowed origins to voiceybill domains ([9adbac9](https://github.com/voiceyBill/voiceyBill-server/commit/9adbac9cf7807dbcb456f524faaf467033b663b5))
* **zod:** make transaction validator compatible with zod@4 (replace errorMap) ([bf6e6e1](https://github.com/voiceyBill/voiceyBill-server/commit/bf6e6e1989cec7b845d771d10397b515d8cff663))
* **zod:** Make validators compatible with zod@4 ([5cc56fc](https://github.com/voiceyBill/voiceyBill-server/commit/5cc56fcbb45027edc7f3d0a7f277e9f1f43231f6))
