<script lang="ts">
	type FormStatus = 'idle' | 'sending' | 'success' | 'error';

	let status = $state<FormStatus>('idle');
	let feedback = $state('');
	let requestId = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		status = 'sending';
		feedback = '';

		const values = Object.fromEntries(new FormData(form));
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(values)
			});
			const result = (await response.json()) as {
				ok: boolean;
				message?: string;
				requestId?: string;
			};
			if (!response.ok || !result.ok)
				throw new Error(result.message ?? 'We could not send your message.');
			status = 'success';
			feedback = result.message ?? 'Your message has been sent.';
			requestId = result.requestId ?? '';
			form.reset();
		} catch (error) {
			status = 'error';
			feedback = error instanceof Error ? error.message : 'We could not send your message.';
		}
	}
</script>

<svelte:head>
	<title>Contact — SiliconBeest</title>
	<meta
		name="description"
		content="Contact the SiliconBeest project about contributions, deployment, and operations."
	/>
</svelte:head>

<section class="contact-page">
	<div class="aurora aurora-one"></div>
	<div class="aurora aurora-two"></div>
	<div class="page-width contact-grid">
		<div class="contact-copy">
			<p class="section-kicker">CONTACT THE PROJECT</p>
			<h1>Build together.<br /><span class="gradient-text">Operate together.</span></h1>
			<p>
				Ask about contributing, the development environment, instance deployment, or operations.
				Your message will be delivered directly to the SiliconBeest project maintainer.
			</p>
			<div class="contact-points">
				<div>
					<span>⌘</span>
					<div>
						<strong>Contribution and development</strong>
						<p>Issues, pull requests, test environments, and implementation direction</p>
					</div>
				</div>
				<div>
					<span>◫</span>
					<div>
						<strong>Deployment and operations</strong>
						<p>Cloudflare resources, migrations, and incident response</p>
					</div>
				</div>
				<div>
					<span>◇</span>
					<div>
						<strong>Security reports</strong>
						<p>Send sensitive reproduction details here instead of a public issue</p>
					</div>
				</div>
			</div>
			<p class="privacy-note">
				Your name, email address, and message are used only to reply and operate the project.
			</p>
		</div>

		<form class="contact-form" onsubmit={submit}>
			<div class="form-heading">
				<div>
					<small>DIRECT MESSAGE</small>
					<h2>Contact the project</h2>
				</div>
				<span class="live-dot"></span>
			</div>
			<div class="field-row">
				<label
					><span>Name</span><input
						name="name"
						autocomplete="name"
						minlength="2"
						maxlength="80"
						required
						placeholder="Name or handle"
					/></label
				>
				<label
					><span>Reply-to email</span><input
						name="email"
						type="email"
						autocomplete="email"
						maxlength="254"
						required
						placeholder="you@example.com"
					/></label
				>
			</div>
			<label
				><span>Topic</span><select name="category" required
					><option value="project">Project question</option><option value="contribution"
						>Contribution and development</option
					><option value="operations">Deployment and operations</option><option value="security"
						>Security report</option
					><option value="other">Other</option></select
				></label
			>
			<label
				><span>Subject</span><input
					name="subject"
					minlength="3"
					maxlength="120"
					required
					placeholder="How can we help?"
				/></label
			>
			<label
				><span>Message</span><textarea
					name="message"
					minlength="20"
					maxlength="5000"
					required
					rows="8"
					placeholder="Include the context, what you tried, and the result you expected so we can respond more quickly."
				></textarea><small class="field-hint"
					>Up to 5,000 characters · Do not send passwords, API tokens, or real user data.</small
				></label
			>
			<label class="honeypot" aria-hidden="true" hidden
				>Website<input name="website" tabindex="-1" autocomplete="off" /></label
			>
			<label class="consent"
				><input type="checkbox" required /><span
					>I agree to send the information above by email so the project can reply.</span
				></label
			>
			<button
				class="button button-primary submit-button"
				type="submit"
				disabled={status === 'sending'}
				>{status === 'sending' ? 'Sending…' : 'Send message'}
				<span aria-hidden="true">→</span></button
			>
			{#if feedback}<div class:error={status === 'error'} class="form-feedback" role="status">
					<span>{status === 'success' ? '✓' : '!'}</span>
					<div>
						<strong>{feedback}</strong>{#if requestId}<small>Request ID: {requestId}</small>{/if}
					</div>
				</div>{/if}
		</form>
	</div>
</section>
