# Changelog

## [1.2.0](https://github.com/voiceyBill/voiceyBill-server/compare/backend-v1.1.0...backend-v1.2.0) (2026-05-22)


### Features

* **backend:** Add unified transactional email template design ([c8f3ec9](https://github.com/voiceyBill/voiceyBill-server/commit/c8f3ec960f8afadfa0c3fe4ae1169be6f9e2cb64))
* **backend:** unify transactional email template design ([6d7596b](https://github.com/voiceyBill/voiceyBill-server/commit/6d7596b3b70f618b63c320017dfeb54a48f4e573))


### Bug Fixes

* **auth:** Add per-email rate limiting to resend-otp endpoint ([43205f0](https://github.com/voiceyBill/voiceyBill-server/commit/43205f024a64027d53f03c6dec9f039c336dd5ed))
* **backend:** remove debug console logs ([52254c8](https://github.com/voiceyBill/voiceyBill-server/commit/52254c81f853b636df221587642219c82c362508))
* **backend:** Remove debug logs ([67d4776](https://github.com/voiceyBill/voiceyBill-server/commit/67d47765dad26123c81632e2810a6e321ce028f1))
* Correct typo 'Transacton' → 'Transaction' in API response ([c72b0e1](https://github.com/voiceyBill/voiceyBill-server/commit/c72b0e12b9cada16b54bea7bdee3b03a63dfa1c3))
* rename transations to transactions in API response ([badb205](https://github.com/voiceyBill/voiceyBill-server/commit/badb205fd9748c60e5a7536dbdd45de014d06e85))
* Rename transations to transactions in API response ([24abd8f](https://github.com/voiceyBill/voiceyBill-server/commit/24abd8fa697fc26e7661e00b3708b503cfa22fa3))
* revert accidental package file changes ([4bd6ef1](https://github.com/voiceyBill/voiceyBill-server/commit/4bd6ef17e79e1827eb17a889c0445de66a2bef8e))

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
