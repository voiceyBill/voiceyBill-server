# Changelog

## [1.3.0](https://github.com/voiceyBill/voiceyBill-server/compare/backend-v1.2.0...backend-v1.3.0) (2026-07-30)


### Features

* add budget tracking feature to mobile app ([bf76c59](https://github.com/voiceyBill/voiceyBill-server/commit/bf76c59995639fc3258814a55ec8bbbffdbf9052))
* Add budget tracking feature to mobile app ([d7e9ad1](https://github.com/voiceyBill/voiceyBill-server/commit/d7e9ad1997ee268ee80f14795da9e02a770f3e97))
* Add combined /analytics/dashboard endpoint ([a7c792d](https://github.com/voiceyBill/voiceyBill-server/commit/a7c792dd8123dd29e6302bf129a281de9416a44c))
* Add Google OAuth authentication backend support ([#126](https://github.com/voiceyBill/voiceyBill-server/issues/126)) ([fd4122a](https://github.com/voiceyBill/voiceyBill-server/commit/fd4122a707d0ba5041aa34e9193e2ca4683a7499))
* **api:** Currency v2 migration - exchange rate service, cron jobs, … ([c980e15](https://github.com/voiceyBill/voiceyBill-server/commit/c980e15f22cf46632a3bd6ca052caa09b76884d8))
* **api:** currency v2 migration - exchange rate service, cron jobs, currency constants ([223bff7](https://github.com/voiceyBill/voiceyBill-server/commit/223bff723f18e091d07b7d3f6afee7423d07aeb9))
* **budget:** validate budgets against the user's real categories ([98554c0](https://github.com/voiceyBill/voiceyBill-server/commit/98554c00e50734e533b8e98d80fe7447b9672fb8))
* **categories:** Add custom category CRUD API for issue [#124](https://github.com/voiceyBill/voiceyBill-server/issues/124) ([#109](https://github.com/voiceyBill/voiceyBill-server/issues/109)) ([e98a4e7](https://github.com/voiceyBill/voiceyBill-server/commit/e98a4e76b5720e2fb3bb78463986e7003cdc70b1))
* **client:** Handled transaction CSV export on frontend ([#137](https://github.com/voiceyBill/voiceyBill-server/issues/137)) ([e9ed4e1](https://github.com/voiceyBill/voiceyBill-server/commit/e9ed4e1f2dac3f1bbadf1d2c8c0e6b880d70a132))
* Revoke refresh tokens with a per-user tokenVersion ([0759aca](https://github.com/voiceyBill/voiceyBill-server/commit/0759aca435f452ec9d8943ae525161f336246af4))
* **server:** Add secure delete account API with authentication ([75ded9c](https://github.com/voiceyBill/voiceyBill-server/commit/75ded9c79354147e4185fcc8fe48e4cdcf1c9525))
* **server:** category-name hardening and request performance logging ([30900bd](https://github.com/voiceyBill/voiceyBill-server/commit/30900bd366034d504409cee8d668b7756541210d))
* **server:** Category-name hardening and request performance logging ([25fa390](https://github.com/voiceyBill/voiceyBill-server/commit/25fa3903159edf7d4f5bab983c18e410e16fafd4))
* **transaction:** Added backend of CSV Export Functionality to the Transaction History Dashboard ([#114](https://github.com/voiceyBill/voiceyBill-server/issues/114)) ([7e68c80](https://github.com/voiceyBill/voiceyBill-server/commit/7e68c802c15f6737b8d63609ebde36141676d16c))
* **voice:** classify voice & receipt into the user's real categories ([c33269b](https://github.com/voiceyBill/voiceyBill-server/commit/c33269b4b9d3e0da395fb2de21f3e518204859cb))


### Bug Fixes

* Add backend support for custom budget categories ([#143](https://github.com/voiceyBill/voiceyBill-server/issues/143)) ([122e321](https://github.com/voiceyBill/voiceyBill-server/commit/122e3211820957cbb071a515e199253ddbf28db9))
* **api:** cast bulk-imported dates to Date and expand range filter ([2accb3e](https://github.com/voiceyBill/voiceyBill-server/commit/2accb3ec87789dc122dc0663161fdf0bc099c1ca))
* **api:** Cast bulk-imported dates to Date and expand range filter ([fd12439](https://github.com/voiceyBill/voiceyBill-server/commit/fd124393962757efc912d3674c9d9472d4f66a84))
* **api:** correct env variable names in currency cron and remove duplicate mongoose index ([b8fb42f](https://github.com/voiceyBill/voiceyBill-server/commit/b8fb42f6365ce59804fee427d8305b80aee3dce6))
* **auth:** Add proper password error message ([b242660](https://github.com/voiceyBill/voiceyBill-server/commit/b242660419dab45ed6c2a70beb5c0ba1885388f4))
* **auth:** Enforce registration password rules during password change ([37dc9b7](https://github.com/voiceyBill/voiceyBill-server/commit/37dc9b7bc0d507d7b428c6e432c5bb8a1d718279))
* **auth:** Enforce registration password rules during password change ([936d73b](https://github.com/voiceyBill/voiceyBill-server/commit/936d73b960dbb884ee1e6998971e2ed0c9e67235))
* **backend:** Merge fallback currencies with provider response to include PKR ([#113](https://github.com/voiceyBill/voiceyBill-server/issues/113)) ([95e5797](https://github.com/voiceyBill/voiceyBill-server/commit/95e5797cfdaaca5c4dcfb615911eef0457d37740))
* **cron:** Propagate Mongoose session to report job transaction writes ([#129](https://github.com/voiceyBill/voiceyBill-server/issues/129)) ([1ee7cee](https://github.com/voiceyBill/voiceyBill-server/commit/1ee7cee4358e5df1531ccfab2ccb80b57c574b4d))
* enforce monthly budget limits and return uncapped usage percentage ([fe041c0](https://github.com/voiceyBill/voiceyBill-server/commit/fe041c030f57e8b79c6fa09e2e057906243ddad5))
* Enforce monthly budget limits and return uncapped usage percentage ([d8e4515](https://github.com/voiceyBill/voiceyBill-server/commit/d8e4515027c83ff4f7487a0ecf41c3284a23baed))
* Escape search keywords before building the transaction query ([80c349b](https://github.com/voiceyBill/voiceyBill-server/commit/80c349b377734a3ed2ba7d6312cc2590425747ca))
* Escape search keywords before building the transaction query ([cd139a2](https://github.com/voiceyBill/voiceyBill-server/commit/cd139a2f2b948f25f0585f107d63ac67afc61a2a))
* **google-auth:** Move GOOGLE_CLIENT_ID guard to request-time to prev… ([87b6a72](https://github.com/voiceyBill/voiceyBill-server/commit/87b6a72167e92cc2356cf440dc313b2bf572873a))
* **google-auth:** move GOOGLE_CLIENT_ID guard to request-time to prevent Vercel crash ([89e6345](https://github.com/voiceyBill/voiceyBill-server/commit/89e63456bf2a92efea008bd62df8548333167825))
* Make budget validation and expense writes atomic ([2cc18a2](https://github.com/voiceyBill/voiceyBill-server/commit/2cc18a2d03a4fddae896b7676f9f0d76eecc9dea))
* Override the transitive multer pinned by platform-express ([269f4f0](https://github.com/voiceyBill/voiceyBill-server/commit/269f4f00e228a5a700d15b9d716bb43e710d25b7))
* Performance (indexes, cold-start) + category-aware voice/budget ([e86051b](https://github.com/voiceyBill/voiceyBill-server/commit/e86051b2137b5e41b8289b85a135db1d76a734da))
* Production hardening — auth revocation, atomic budget writes, rate-limit fix ([9a2c4c6](https://github.com/voiceyBill/voiceyBill-server/commit/9a2c4c6ae5d468450b326f13882b185724d0148e))
* Reject unsupported image uploads instead of hanging ([6f2239c](https://github.com/voiceyBill/voiceyBill-server/commit/6f2239cb45d8a0253cf857f2c35909fe81295fe9))
* Reject unsupported image uploads instead of hanging ([717cc94](https://github.com/voiceyBill/voiceyBill-server/commit/717cc943fc4654ff6d9bbf9178b6859e8c691bcb))
* **server:** group categories case-insensitively and calculate percentage with decimals ([c7693a9](https://github.com/voiceyBill/voiceyBill-server/commit/c7693a93b07fbd2048ee310ab86f537fb361227e))
* **server:** Group categories case-insensitively and calculate percentage with decimals ([d84050d](https://github.com/voiceyBill/voiceyBill-server/commit/d84050d3bbd551150780a388ea70494abb5087c7))
* Trust the Vercel proxy and raise the JSON body limit ([69ef7a6](https://github.com/voiceyBill/voiceyBill-server/commit/69ef7a66ddc74eb66a70bf87b52cfccd0a8c466b))
* **validation:** Allow decimal amounts less than 1 in transactions ([821c835](https://github.com/voiceyBill/voiceyBill-server/commit/821c835010e6e1135ada86b91329dde1f4d5ff0b))
* **validation:** Allow decimal amounts less than 1 in transactions ([5a2499e](https://github.com/voiceyBill/voiceyBill-server/commit/5a2499ed7dbbb8851e5f0c914dba96021823adbb))


### Performance Improvements

* Skip the category count query when categories exist ([fb72a00](https://github.com/voiceyBill/voiceyBill-server/commit/fb72a00109d4a341a4d938d7d5f51aa77f137f59))

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
