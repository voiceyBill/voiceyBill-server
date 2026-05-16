# Changelog

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
