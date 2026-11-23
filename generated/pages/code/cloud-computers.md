# Cloud Computers

> Source: caveman-ai/caveman-code/docs/cloud-computers.mdx

Cloud computers let a Caveman Code session run on an isolated Firecracker microVM hosted by Caveman Cloud, so long builds and test suites continue even after you close your laptop.

## How credentials stay safe

Your provider keys and GitHub logins never enter a Cloud computer. All model requests and git pushes route through the Caveman Cloud relay, which attaches credentials per request and restricts pushes to `caveman/*` branches.

## Sleep and resume

Idle computers pause automatically and preserve their disk state so you pay nothing while paused. Reopening a thread wakes the computer and resumes the session from its append-only journal.
