export type DocBlock =
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: string[] }
	| { type: 'steps'; items: { title: string; text: string }[] }
	| { type: 'code'; label: string; code: string }
	| { type: 'callout'; tone: 'info' | 'warning' | 'success'; title: string; text: string }
	| { type: 'table'; headers: string[]; rows: string[][] };

export type DocSection = {
	id: string;
	title: string;
	lead?: string;
	blocks: DocBlock[];
};

export type DocPage = {
	slug: string;
	icon: string;
	category: string;
	title: string;
	description: string;
	readTime: string;
	sections: DocSection[];
};

export const docs: DocPage[] = [
	{
		slug: 'getting-started',
		icon: '↗',
		category: 'Getting started',
		title: 'Deploy your first instance',
		description:
			'Choose a domain, provision Cloudflare resources, deploy, and verify federation from end to end.',
		readTime: '12 min read',
		sections: [
			{
				id: 'before-you-start',
				title: 'Before you begin',
				lead: 'SiliconBeest is a Fediverse server that runs on the Cloudflare developer platform without a traditional server.',
				blocks: [
					{
						type: 'callout',
						tone: 'warning',
						title: 'Your domain is effectively a permanent identifier',
						text: 'Changing the instance domain after federation begins breaks existing follows, conversations, and ActivityPub actor URIs cached by remote servers. Finalize the domain before launch.'
					},
					{
						type: 'list',
						items: [
							'A Cloudflare account with Workers enabled',
							'A dedicated domain managed by Cloudflare',
							'Node.js 22.13+, 24.11+, or 26+',
							'A GitHub account and a repository with Actions enabled'
						]
					}
				]
			},
			{
				id: 'install',
				title: 'Install and provision resources',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Create a repository from the template',
								text: 'Select Use this template in SJang1/siliconbeest to create your own repository.'
							},
							{
								title: 'Run the installation script',
								text: 'The interactive installer provisions D1, R2, KV, Queues, and the required keys.'
							},
							{
								title: 'Add the GitHub values',
								text: 'Store the generated resource IDs as repository variables, and the API token and account ID as secrets.'
							},
							{
								title: 'Run the Deploy workflow',
								text: 'Run the Deploy workflow in Actions to deploy all three Workers and the database migrations.'
							}
						]
					},
					{
						type: 'code',
						label: 'Terminal',
						code: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/SJang1/siliconbeest/HEAD/scripts/install.sh)"'
					}
				]
			},
			{
				id: 'variables',
				title: 'Required GitHub settings',
				blocks: [
					{
						type: 'table',
						headers: ['Type', 'Key', 'Purpose'],
						rows: [
							[
								'Secret',
								'CLOUDFLARE_API_TOKEN',
								'API token used to deploy Workers and data resources'
							],
							['Secret', 'CLOUDFLARE_ACCOUNT_ID', 'Cloudflare account identifier'],
							['Variable', 'PROJECT_PREFIX', 'Prefix used for Cloudflare resource names'],
							['Variable', 'INSTANCE_DOMAIN', 'The finalized instance domain'],
							['Variable', 'INSTANCE_TITLE', 'The display name of the service'],
							['Variable', 'REPOSITORY_URL', 'Public source repository URL'],
							['Variable', 'REGISTRATION_MODE', 'open, approval, or closed'],
							[
								'Variable',
								'D1_DATABASE_ID · KV_*_ID',
								'Resource identifiers created by the installer'
							]
						]
					}
				]
			},
			{
				id: 'federation-check',
				title: 'Verify your first federation',
				blocks: [
					{
						type: 'callout',
						tone: 'warning',
						title: 'Cloudflare bot-protection exceptions are required',
						text: 'Bot Fight Mode can return 403 for ActivityPub requests to /users/* and /inbox. Configure a WAF Skip rule for ActivityPub content types.'
					},
					{
						type: 'list',
						items: [
							'Confirm the local actor URL in the /.well-known/webfinger response',
							'Check the /nodeinfo/2.0 response and software name',
							'Find and follow the local account from a remote Mastodon or Misskey account',
							'Confirm two-way delivery of public posts and custom emoji reactions',
							'Ensure the federation queue and DLQ are not accumulating in the admin console'
						]
					}
				]
			}
		]
	},
	{
		slug: 'development',
		icon: '⌘',
		category: 'Development',
		title: 'Development guide',
		description:
			'Understand the monorepo, local development, tests, migrations, and contribution rules.',
		readTime: '15 min read',
		sections: [
			{
				id: 'repository',
				title: 'Repository structure',
				blocks: [
					{
						type: 'callout',
						tone: 'info',
						title: 'Verified against the current source tree',
						text: 'The structure below is derived from package manifests, Nuxt and Cloudflare entrypoints, Worker bindings, route imports, and test directories in the current repository. Contribution documents remain useful for policy, but they are not the source for this architecture map.'
					},
					{
						type: 'table',
						headers: ['Path', 'Role'],
						rows: [
							[
								'package.json · pnpm-workspace.yaml',
								'Monorepo scripts and the four workspace package groups'
							],
							[
								'siliconbeest/app.vue · pages/',
								'Nuxt 4 application shell and filesystem route entrypoints'
							],
							[
								'siliconbeest/src/',
								'Vue views, stores, composables, API clients, localization, and Deck/Aurora/classic UI surfaces'
							],
							[
								'siliconbeest/server/index.ts',
								'Unified request router for the Hono API, ActivityPub, Nuxt SSR, static assets, and crawler metadata'
							],
							[
								'siliconbeest/server/worker/',
								'Hono endpoints, OAuth, authentication, Fedify dispatchers and inbox processors, services, repositories, middleware, and StreamingDO'
							],
							[
								'siliconbeest/migrations/ · test/',
								'Sequential D1 migrations plus separate Vue and Worker test suites'
							],
							[
								'siliconbeest-queue-consumer/',
								'Federation and internal queue consumers, DLQ parking, timeline fan-out, media, notifications, Web Push, and remote fetches'
							],
							['siliconbeest-email-sender/', 'Email queue consumption and SMTP delivery'],
							[
								'packages/shared/',
								'Cross-Worker ActivityPub, queue, database, serializer, permission, domain-block, and cryptographic contracts'
							],
							[
								'scripts/',
								'Resource provisioning, config generation, migrations, backup, deployment, updates, and account administration'
							],
							[
								'.github/workflows/',
								'Production deploy, trusted PR preview, and upstream release sync automation'
							]
						]
					}
				]
			},
			{
				id: 'local',
				title: 'Local development',
				blocks: [
					{
						type: 'paragraph',
						text: 'Start routine UI and API development with the main app. Run the supporting Workers only when changing queue or email paths.'
					},
					{
						type: 'code',
						label: 'Terminal',
						code: 'pnpm install --frozen-lockfile\npnpm --filter siliconbeest-vue dev\n\n# In separate terminals, only when needed\npnpm --filter siliconbeest-queue-consumer dev\npnpm --filter siliconbeest-email-sender dev'
					},
					{
						type: 'callout',
						tone: 'info',
						title: 'You do not need the full setup every time',
						text: 'Unit tests and UI work do not require ./scripts/setup.sh. Prepare the full Cloudflare environment only when validating real D1, R2, KV, and Queue connections together.'
					}
				]
			},
			{
				id: 'database',
				title: 'Migrations and bindings',
				blocks: [
					{
						type: 'list',
						items: [
							'Add new SQL to siliconbeest/migrations/ using the NNNN_short_description.sql format.',
							'Do not modify a migration that has already been deployed.',
							'Review rollout and rollback effects on instances with existing data first.',
							'When wrangler.jsonc bindings change, regenerate types for every affected Worker.'
						]
					},
					{
						type: 'code',
						label: 'Terminal',
						code: './scripts/migrate.sh --local\npnpm --filter siliconbeest-vue cf-typegen\npnpm --filter siliconbeest-queue-consumer cf-typegen\npnpm --filter siliconbeest-email-sender cf-typegen'
					}
				]
			},
			{
				id: 'quality',
				title: 'Testing and quality bar',
				blocks: [
					{
						type: 'code',
						label: 'Recommended before opening a PR',
						code: 'pnpm lint\npnpm test\npnpm --filter siliconbeest-vue type-check\npnpm build'
					},
					{
						type: 'list',
						items: [
							'Test both allowed and denied cases for permission changes.',
							'For ActivityPub changes, verify visibility, signatures, audiences, duplicate handling, and the DLQ.',
							'Keep SSRF defenses and protocol, redirect, size, and timeout limits on external URL fetches.',
							'Check keyboard focus, light and dark modes, mobile layouts, and RTL languages for UI changes.',
							'Do not commit secrets, real user data, .env files, or personal Cloudflare resource IDs.'
						]
					}
				]
			},
			{
				id: 'pull-request',
				title: 'Changes and pull requests',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Keep the scope focused',
								text: 'Each pull request should address one logical change without unrelated formatting edits.'
							},
							{
								title: 'Describe the impact',
								text: 'Document API and federation compatibility, migrations, new bindings, and deployment order in the pull request.'
							},
							{
								title: 'Provide evidence',
								text: 'List the tests you ran and attach before-and-after screenshots for UI changes.'
							},
							{
								title: 'Check AGPLv3 obligations',
								text: 'Source-sharing requirements also apply to modified versions offered as a network service.'
							}
						]
					},
					{
						type: 'callout',
						tone: 'success',
						title: 'If you need a Cloudflare development environment',
						text: 'Use the project contact channel listed in the contribution documents to request access to paid or Enterprise Workers testing and discuss federation test requirements.'
					}
				]
			}
		]
	},
	{
		slug: 'operations',
		icon: '◫',
		category: 'Operations',
		title: 'Operations guide',
		description:
			'Run updates, backups, monitoring, incident response, and security reviews in a practical order.',
		readTime: '21 min read',
		sections: [
			{
				id: 'routine',
				title: 'Operations routine',
				blocks: [
					{
						type: 'table',
						headers: ['Cadence', 'What to review'],
						rows: [
							[
								'Daily',
								'Worker error rates, queue backlog and DLQ, email failures, remote federation delays'
							],
							[
								'Weekly',
								'D1 and R2 usage, new reports and blocks, admin audit logs, backup results'
							],
							[
								'Monthly',
								'Dependencies and upstream releases, restore drills, API token permissions, cost trends'
							],
							[
								'Before changes',
								'Backups, migration impact, rollback criteria, maintenance window, and notice'
							]
						]
					},
					{
						type: 'callout',
						tone: 'success',
						title: 'Keep a human in the loop for automatic updates',
						text: 'The default Sync Upstream & Deploy workflow checks for releases every day at 00:00 UTC. An operator must still review conflicts, migrations, and feature-change notices.'
					}
				]
			},
			{
				id: 'update',
				title: 'Safe updates',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Review the release and migrations',
								text: 'Review changes, compatibility, environment variables, and D1 updates between the current and target versions.'
							},
							{
								title: 'Create a backup and baseline',
								text: 'Create a D1 backup and record error rates, queue latency, and key API responses.'
							},
							{
								title: 'Run the update',
								text: 'After you update the working tree yourself, the script installs dependencies, checks types and tests, applies D1 migrations, and deploys all three Workers in order.'
							},
							{
								title: 'Run smoke tests',
								text: 'Verify login, posting, media, inbound and outbound federation, WebSockets, and email.'
							},
							{
								title: 'Maintain an observation window',
								text: 'If new errors or DLQ volume exceed the baseline, stop further deployments and isolate the cause.'
							}
						]
					},
					{
						type: 'code',
						label: 'Terminal',
						code: 'git fetch origin\ngit switch main\ngit pull --ff-only origin main\n\n# Validate the exact checked-out code without deploying.\n./scripts/update.sh --dry-run\n\n# Apply migrations and deploy all three Workers.\n./scripts/update.sh'
					}
				]
			},
			{
				id: 'ci-push-races',
				title: 'Resolve CI push races',
				lead: 'A workflow can fail when it tries to update main while another workflow or maintainer changes the same branch. GitHub rejects the stale update instead of overwriting the newer commit.',
				blocks: [
					{
						type: 'code',
						label: 'Typical GitHub Actions failure',
						code: "git push origin main\n! [remote rejected] main -> main (cannot lock ref 'refs/heads/main': is at 135f083... but expected 28f3652...)\nerror: failed to push some refs to 'https://github.com/SJang1/siliconbeest.sjang.dev'"
					},
					{
						type: 'callout',
						tone: 'info',
						title: 'This is a concurrency conflict, not repository corruption',
						text: 'The remote main ref moved after the workflow read it. Fetch the new ref, replay the workflow commit on top of it, and push again. If main moves again before the push completes, repeat the same bounded retry.'
					},
					{
						type: 'steps',
						items: [
							{
								title: 'Inspect and fetch the current remote branch',
								text: 'Confirm the commit created by the update job, then fetch the newest origin/main without discarding local work.'
							},
							{
								title: 'Rebase the update commit',
								text: 'Replay the local CI or .github changes on top of origin/main. Resolve any conflicts explicitly, stage the resolved files, and continue the rebase.'
							},
							{
								title: 'Push the rebased commit',
								text: 'Push HEAD to main. A normal push preserves every remote commit and works with branch protection.'
							},
							{
								title: 'Retry only if the ref moved again',
								text: 'Run fetch, rebase, and push again with a small retry limit. If conflicts keep recurring, stop automatic updates and review the competing workflows.'
							}
						]
					},
					{
						type: 'code',
						label: 'Safe manual recovery',
						code: 'git status\ngit log -1 --oneline\ngit fetch origin main\ngit rebase origin/main\n\n# If Git reports conflicts:\ngit status\n# Edit each conflicted file, then stage only the resolved files.\ngit add <resolved-files>\ngit rebase --continue\n\n# Publish without rewriting remote history.\ngit push origin HEAD:main'
					},
					{
						type: 'code',
						label: 'Abort and return to the pre-rebase state',
						code: 'git rebase --abort'
					},
					{
						type: 'callout',
						tone: 'warning',
						title: 'Do not force-push a shared main branch',
						text: 'Avoid git push --force and automatic conflict resolution. They can remove the commit that won the race or silently select the wrong .github workflow. Use a normal push after rebasing, and let branch protection reject unsafe updates.'
					},
					{
						type: 'list',
						items: [
							'Keep update workflows idempotent so a rerun produces the same files and commits only real changes.',
							'Use GitHub Actions concurrency to serialize workflows that write to the same branch.',
							'Give write access only to the job that performs the final push, with contents: write scoped as narrowly as possible.',
							'Stop after a small number of retries and surface the conflicting commits for operator review.'
						]
					}
				]
			},
			{
				id: 'backup',
				title: 'Backup and recovery',
				blocks: [
					{
						type: 'paragraph',
						text: 'D1 is the system of record for accounts, posts, and settings, while R2 stores media. Configuration and secrets must be recoverable from a separate secure store, not the repository.'
					},
					{ type: 'code', label: 'Terminal', code: './scripts/backup.sh' },
					{
						type: 'list',
						items: [
							"Record each backup file's creation time, size, and hash.",
							'Test restoration against isolated resources, never the production instance.',
							'After restoration, compare account counts, recent posts, settings, and media-reference integrity.',
							'Document the RPO and RTO, and shorten backup intervals as the instance grows.',
							'Backups contain personal data, so restrict access and retention periods.'
						]
					}
				]
			},
			{
				id: 'incident',
				title: 'Incident response',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Establish the impact',
								text: 'Record which paths—web, API, federation, streaming, or email—are affected and when the impact began.'
							},
							{
								title: 'Freeze changes',
								text: 'Pause automatic deployments and compare recent releases and configuration changes with Cloudflare status.'
							},
							{
								title: 'Preserve the queues',
								text: 'Do not delete failed messages prematurely. Fix the cause, then reprocess them in controlled batches.'
							},
							{
								title: 'Communicate with users',
								text: 'Publish only confirmed impact and workarounds without exposing personal data or attack details.'
							},
							{
								title: 'Review and follow up',
								text: 'Record detection, mitigation, and recovery times, the root cause, and prevention actions.'
							}
						]
					},
					{
						type: 'callout',
						tone: 'warning',
						title: 'First check for 403 federation failures',
						text: 'When remote-server requests return 403, check Cloudflare Bot Fight Mode and the ActivityPub WAF Skip rule before application code.'
					}
				]
			},
			{
				id: 'security',
				title: 'Operations security checklist',
				blocks: [
					{
						type: 'list',
						items: [
							'Enable a passkey or TOTP for administrator accounts and store the recovery process separately.',
							'Limit Cloudflare API tokens to required accounts and resources, and rotate them regularly.',
							'Keep SKIP_SIGNATURE_VERIFICATION false except for explicit isolated testing.',
							'Keep setup, OTP-encryption, Turnstile, and deployment credentials in Wrangler secrets or GitHub Secrets. The email Worker currently reads SMTP settings from D1, so restrict admin access and protect database backups.',
							'Review audit logs for reports, domain blocks, pending approvals, and invite credits regularly.',
							'Before deleting an account, check backup and legal-retention requirements and federation Delete delivery.'
						]
					},
					{
						type: 'code',
						label: 'Account management',
						code: './scripts/delete-account.sh <username>'
					}
				]
			}
		]
	},
	{
		slug: 'architecture',
		icon: '⌬',
		category: 'Concepts',
		title: 'Architecture',
		description:
			'Learn how three Workers and Cloudflare data services handle requests, federation, and real-time events.',
		readTime: '10 min read',
		sections: [
			{
				id: 'overview',
				title: 'Three Workers',
				blocks: [
					{
						type: 'table',
						headers: ['Component', 'Responsibility'],
						rows: [
							[
								'siliconbeest',
								'Nuxt 4 SSR and Vue UI, unified Hono API and ActivityPub routing, OAuth, Fedify, admin API, assets, and StreamingDO'
							],
							[
								'queue-consumer',
								'Federation, internal, and federation-DLQ consumption; fan-out, media, notifications, Web Push, remote fetches, and DLQ parking'
							],
							['email-sender', 'Dedicated email queue consumption with SMTP settings read from D1']
						]
					},
					{
						type: 'paragraph',
						text: 'The main Worker responds to users quickly and sends slow or retryable work to queues. Consumers retry idempotently, and operators inspect final failures in the DLQ.'
					}
				]
			},
			{
				id: 'storage',
				title: 'Data services',
				blocks: [
					{
						type: 'table',
						headers: ['Service', 'What it stores'],
						rows: [
							['D1', 'Accounts, posts, relationships, settings, and transactional data'],
							['R2', 'Uploaded media and generated thumbnails'],
							['KV', 'Caches, sessions, and Fedify key-value state'],
							['Queues', 'Asynchronous federation, internal job, and email messages'],
							['Durable Objects', 'WebSocket connections and real-time timeline streaming']
						]
					}
				]
			},
			{
				id: 'request-flow',
				title: 'The lifecycle of a post',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Validate the API request',
								text: 'Check OAuth scopes, account state, visibility, and input.'
							},
							{
								title: 'Write to D1',
								text: 'Persist the post and local timeline state within a transaction boundary.'
							},
							{
								title: 'Fan out internally',
								text: 'Enqueue follower timeline and notification work.'
							},
							{
								title: 'Deliver through federation',
								text: 'Fedify creates the ActivityPub object and sends signed requests to target inboxes.'
							},
							{
								title: 'Update in real time',
								text: 'The Durable Object sends the new event to connected clients.'
							}
						]
					}
				]
			},
			{
				id: 'boundaries',
				title: 'Design boundaries',
				blocks: [
					{
						type: 'list',
						items: [
							'Mastodon API compatibility is a contract with the client ecosystem.',
							'Fedify owns the WebFinger, HTTP Signature, NodeInfo, and ActivityPub protocol boundaries.',
							'Types, permissions, and cryptographic utilities in packages/shared are contracts between producers and consumers.',
							'Asynchronous messages may be delivered more than once, so consumers must remain idempotent.',
							'Remote content is untrusted and must pass HTML sanitization and SSRF defenses.'
						]
					}
				]
			}
		]
	},
	{
		slug: 'federation',
		icon: '◎',
		category: 'Federation',
		title: 'Federation and compatibility',
		description:
			'Understand ActivityPub, the Mastodon API, Misskey extensions, and federation troubleshooting.',
		readTime: '11 min read',
		sections: [
			{
				id: 'protocols',
				title: 'Supported protocols',
				blocks: [
					{
						type: 'list',
						items: [
							'ActivityPub server-to-server federation with WebFinger and NodeInfo',
							'draft-cavage and RFC 9421 HTTP Message Signatures',
							'Ed25519 Object Integrity Proofs(FEP-8b32)',
							'Followers Collection Synchronization(FEP-8fcf)',
							'Quote Posts (FEP-e232) and featured collections',
							'Misskey EmojiReact, _misskey_content, and _misskey_quote',
							'Third-party clients built on Mastodon API v1/v2'
						]
					}
				]
			},
			{
				id: 'visibility',
				title: 'Visibility and delivery',
				blocks: [
					{
						type: 'table',
						headers: ['Visibility', 'Local and federated behavior'],
						rows: [
							[
								'public',
								'Appears on public timelines and is delivered to followers and relevant remote servers'
							],
							['unlisted', 'Directly accessible but excluded from public timelines'],
							['private', 'Delivered only to the approved followers audience'],
							[
								'direct',
								'Delivered only to named recipients and excluded from search and public surfaces'
							]
						]
					},
					{
						type: 'callout',
						tone: 'info',
						title: 'A key rule for bug fixes',
						text: 'Changes involving visibility must cover local and remote accounts, allow and deny cases, search, streaming, and notifications.'
					}
				]
			},
			{
				id: 'troubleshooting',
				title: 'Federation troubleshooting order',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Discovery',
								text: 'Confirm that WebFinger and NodeInfo return the correct domain and actor.'
							},
							{
								title: 'Edge',
								text: 'Confirm that Cloudflare WAF, Bot Fight Mode, and TLS are not blocking the request.'
							},
							{
								title: 'Signature',
								text: 'Inspect Date, Digest, keyId, and signature-verification logs, and check clock skew.'
							},
							{
								title: 'Audience',
								text: 'Check that to, cc, visibility, and block policies match the intended audience.'
							},
							{
								title: 'Queue',
								text: 'Use retry counts, response codes, and DLQ messages to locate the actual failure.'
							}
						]
					}
				]
			}
		]
	},
	{
		slug: 'security',
		icon: '◇',
		category: 'Security',
		title: 'Security baseline',
		description:
			'Project standards for authentication, authorization, untrusted input, and operational secrets.',
		readTime: '9 min read',
		sections: [
			{
				id: 'identity',
				title: 'Authentication and authorization',
				blocks: [
					{
						type: 'list',
						items: [
							'Apply OAuth 2.0 + PKCE and hierarchical Mastodon scopes to every protected endpoint.',
							'Store access tokens as SHA-256 hashes, never plaintext.',
							'Support TOTP and WebAuthn/passkeys, and strongly recommend them for administrators.',
							'Recheck suspended accounts, object ownership, administrator privileges, and registration mode on the server.',
							'Apply CSP, X-Content-Type-Options, and anti-framing headers to browser and API responses.'
						]
					}
				]
			},
			{
				id: 'untrusted-input',
				title: 'Trust boundaries',
				blocks: [
					{
						type: 'table',
						headers: ['Input', 'Required defense'],
						rows: [
							[
								'Federated HTML',
								'Allowlist sanitization and removal of dangerous URLs and attributes'
							],
							['Remote URLs', 'SSRF defense plus IP, protocol, redirect, size, and timeout limits'],
							[
								'Media',
								'MIME and size validation, asynchronous processing, and safe Content-Disposition'
							],
							[
								'OAuth requests',
								'Exact redirect URI matching plus PKCE, scope, and state validation'
							],
							['ActivityPub', 'Signature, Digest, actor, domain, and audience validation']
						]
					}
				]
			},
			{
				id: 'reporting',
				title: 'Vulnerability reporting',
				blocks: [
					{
						type: 'callout',
						tone: 'warning',
						title: 'Do not post sensitive reproduction details in public issues',
						text: 'Report vulnerabilities that require coordinated disclosure privately to the repository owner. Remove real tokens, user data, and details about instances under active attack.'
					},
					{
						type: 'list',
						items: [
							'Affected versions and configuration',
							'Minimal reproduction steps and expected versus actual results',
							'Impact on permissions, visibility, and federation',
							'Logs or a proof of concept with secrets removed',
							'A secure channel for contacting the reporter'
						]
					}
				]
			}
		]
	},
	{
		slug: 'instance-directory',
		icon: '◉',
		category: 'Community',
		title: 'List your instance',
		description:
			'Add a community-run SiliconBeest server to the public instance directory through a validated pull request.',
		readTime: '7 min read',
		sections: [
			{
				id: 'registry',
				title: 'One public registry',
				lead: 'The root instance.json file is the single source of truth for stable directory metadata. After the page renders, the browser calls a separate project API that resolves description, languages, source URL, thumbnail, and registration mode from each server.',
				blocks: [
					{
						type: 'callout',
						tone: 'info',
						title: 'Keep the registry static and reviewable',
						text: 'Store stable public metadata only. Description, languages, source URL, thumbnail, registration mode, version numbers, user counts, uptime, and other live API values do not belong in instance.json.'
					},
					{
						type: 'callout',
						tone: 'success',
						title: 'Live fields come from the instance API',
						text: 'After page load, the directory calls /api/instances/metadata. That endpoint requests the optional uri field, or derives /api/v2/instance from url, and reads description, languages, source_url, thumbnail.url, and registrations.mode. SiliconBeest currently returns open, approval, referral, or closed. Unreachable or invalid fields are shown as unavailable rather than guessed.'
					},
					{
						type: 'table',
						headers: ['Field', 'What to provide'],
						rows: [
							[
								'name · domain · url',
								'Public name and an HTTPS origin whose hostname matches the domain'
							],
							['uri', 'Optional explicit HTTPS /api/v2/instance endpoint on the same domain'],
							['status', 'production, active, development, or maintenance'],
							['featured', 'Optional maintainer-curated feature flag']
						]
					}
				]
			},
			{
				id: 'submit',
				title: 'Submit a pull request',
				blocks: [
					{
						type: 'steps',
						items: [
							{
								title: 'Fork and branch',
								text: 'Fork SJang1/siliconbeest-io, then create a focused branch such as instances/example-social.'
							},
							{
								title: 'Add one registry entry',
								text: 'Edit only instance.json for a normal submission. Preserve the schema version and do not change another operator’s entry.'
							},
							{
								title: 'Validate locally',
								text: 'Run the deterministic registry validator, then type-check and build the site.'
							},
							{
								title: 'Open the pull request',
								text: 'Complete the instance pull request checklist. A maintainer may verify the public Mastodon-compatible instance endpoint before merging.'
							}
						]
					},
					{
						type: 'code',
						label: 'Terminal',
						code: 'git switch -c instances/example-social\n# Edit instance.json\npnpm validate:instances\npnpm check\npnpm build\ngit add instance.json\ngit commit -m "Add example.social to the instance directory"\ngit push -u origin instances/example-social'
					}
				]
			},
			{
				id: 'example',
				title: 'Minimal entry example',
				blocks: [
					{
						type: 'code',
						label: 'instance.json',
						code: '{\n  "name": "Example Social",\n  "domain": "example.social",\n  "url": "https://example.social",\n  "status": "active"\n}'
					},
					{
						type: 'callout',
						tone: 'info',
						title: 'Only stable directory fields belong here',
						text: 'Do not add description, languages, source_url, thumbnail, or registration mode: the directory fetches those fields asynchronously from url + /api/v2/instance. Add uri only when the instance API uses an explicit endpoint.'
					},
					{
						type: 'callout',
						tone: 'warning',
						title: 'Do not submit private or operational data',
						text: 'Do not include personal email addresses, API tokens, private analytics, user counts, infrastructure identifiers, or secrets. Link only to information that the operator intentionally publishes.'
					}
				]
			},
			{
				id: 'review',
				title: 'Review and maintenance',
				blocks: [
					{
						type: 'list',
						items: [
							'The validation workflow rejects unknown fields, duplicate domains, non-HTTPS URLs, and domain or API-path mismatches.',
							'Maintainers verify that the server identifies itself as SiliconBeest and that description, languages, source_url, and thumbnail.url are supplied by its public API.',
							'Description, languages, source URL, thumbnail, and registration mode update automatically from the live API; operators should submit a follow-up pull request when status, ownership, or other stable metadata changes.',
							'Entries may be marked maintenance or removed when the domain no longer serves a SiliconBeest instance.',
							'The featured flag is curated by directory maintainers and is not guaranteed by submission.'
						]
					}
				]
			}
		]
	},
	{
		slug: 'using-siliconbeest',
		icon: '✦',
		category: 'Using SiliconBeest',
		title: 'Using SiliconBeest',
		description:
			'Use the web app, Mastodon-compatible clients, visibility controls, and the development instance safely.',
		readTime: '6 min read',
		sections: [
			{
				id: 'choose-client',
				title: 'Web and third-party apps',
				blocks: [
					{
						type: 'paragraph',
						text: 'SiliconBeest supports Mastodon API v1/v2, so you can connect clients such as Tusky, Elk, Ice Cubes, Ivory, and Mona. SiliconBeest-specific features may appear on the web first.'
					},
					{
						type: 'callout',
						tone: 'info',
						title: 'About the development site',
						text: 'siliconbeest.sjang.dev is an instance for project development and interoperability testing. Do not assume accounts or posts will be retained long term; use a separate instance for an important community.'
					}
				]
			},
			{
				id: 'posting',
				title: 'Posting and federation',
				blocks: [
					{
						type: 'list',
						items: [
							'Check visibility before posting, and review the recipients of sensitive direct conversations.',
							'Public posts are replicated to other servers, so deletion from every remote cache cannot be immediate or guaranteed.',
							'Use content warnings and sensitive-media markers when appropriate.',
							'Delivery results may vary with remote-server policies and blocks.',
							'Report harassment, spam, and illegal content to the relevant instance operator.'
						]
					}
				]
			},
			{
				id: 'appearance',
				title: 'Appearance and accessibility',
				blocks: [
					{
						type: 'paragraph',
						text: 'SiliconBeest supports light and dark themes, responsive layouts, and multiple languages. This project hub uses the same theme key for a familiar visual experience.'
					},
					{
						type: 'list',
						items: [
							'Let the theme follow your system setting or switch it manually.',
							'Use the primary navigation and actions with a keyboard alone.',
							'Browser zoom is supported without clipping text.',
							'When reporting a problem, include the browser or client, viewport size, and reproduction steps.'
						]
					}
				]
			}
		]
	}
];

export const featuredDocs = docs.slice(0, 3);

export function findDoc(slug: string): DocPage | undefined {
	return docs.find((doc) => doc.slug === slug);
}
