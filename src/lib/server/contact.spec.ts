import { describe, expect, it } from 'vitest';
import { buildContactEmail, escapeHtml, validateContactInput } from './contact';

const validInput = {
	name: 'Dev Example',
	email: 'dev@example.com',
	category: 'contribution',
	subject: 'Question about contributing',
	message: 'I would like to add tests and open a pull request.',
	website: ''
};

describe('contact form validation', () => {
	it('accepts and normalizes a valid request', () => {
		const result = validateContactInput(validInput);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.email).toBe('dev@example.com');
	});

	it('rejects honeypot submissions', () => {
		const result = validateContactInput({ ...validInput, website: 'https://spam.example' });
		expect(result.ok).toBe(false);
	});

	it('escapes user-authored HTML in the email body', () => {
		expect(escapeHtml('<script>alert("x")</script>')).toBe(
			'&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
		);
		const result = validateContactInput({
			...validInput,
			message: '<b>Hello</b> This is a safe contact message.'
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			const email = buildContactEmail(result.value, 'request-id');
			expect(email.html).toContain('&lt;b&gt;Hello&lt;/b&gt;');
			expect(email.html).not.toContain('<b>Hello</b>');
		}
	});
});
