import { readFile } from 'node:fs/promises';

const registryUrl = new URL('../instance.json', import.meta.url);
const allowedRootKeys = new Set(['$schema', 'schemaVersion', 'instances']);
const allowedInstanceKeys = new Set(['name', 'domain', 'url', 'uri', 'status', 'featured']);
const statuses = new Set(['production', 'active', 'development', 'maintenance']);
const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

const errors = [];

function fail(path, message) {
	errors.push(`${path}: ${message}`);
}

function checkKeys(value, allowed, path) {
	for (const key of Object.keys(value)) {
		if (!allowed.has(key)) fail(path, `unknown property ${JSON.stringify(key)}`);
	}
}

function parseHttpsUrl(value, path) {
	if (typeof value !== 'string') {
		fail(path, 'must be a string');
		return null;
	}
	try {
		const parsed = new URL(value);
		if (parsed.protocol !== 'https:') fail(path, 'must use HTTPS');
		if (parsed.username || parsed.password) fail(path, 'must not contain credentials');
		return parsed;
	} catch {
		fail(path, 'must be a valid absolute URL');
		return null;
	}
}

let registry;
try {
	registry = JSON.parse(await readFile(registryUrl, 'utf8'));
} catch (error) {
	console.error(`instance.json: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
}

if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
	fail('instance.json', 'must contain a JSON object');
} else {
	checkKeys(registry, allowedRootKeys, 'instance.json');
	if (registry.$schema !== './instance.schema.json')
		fail('$schema', 'must point to ./instance.schema.json');
	if (registry.schemaVersion !== 1) fail('schemaVersion', 'must be 1');
	if (!Array.isArray(registry.instances)) fail('instances', 'must be an array');
}

const domains = new Set();
const urls = new Set();

for (const [index, instance] of (registry?.instances ?? []).entries()) {
	const path = `instances[${index}]`;
	if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
		fail(path, 'must be an object');
		continue;
	}

	checkKeys(instance, allowedInstanceKeys, path);
	for (const key of ['name', 'domain', 'url', 'status']) {
		if (!(key in instance)) fail(path, `missing required property ${JSON.stringify(key)}`);
	}

	if (typeof instance.name !== 'string' || instance.name.length < 2 || instance.name.length > 80)
		fail(`${path}.name`, 'must contain 2–80 characters');
	if (typeof instance.domain !== 'string' || !domainPattern.test(instance.domain))
		fail(`${path}.domain`, 'must be a lowercase hostname');
	else if (domains.has(instance.domain)) fail(`${path}.domain`, 'must be unique');
	else domains.add(instance.domain);

	const siteUrl = parseHttpsUrl(instance.url, `${path}.url`);
	if (siteUrl && siteUrl.hostname !== instance.domain)
		fail(`${path}.url`, 'hostname must match domain');
	if (siteUrl && siteUrl.pathname !== '/')
		fail(`${path}.url`, 'must point to the instance origin without a path');
	if (typeof instance.url === 'string' && urls.has(instance.url))
		fail(`${path}.url`, 'must be unique');
	else if (typeof instance.url === 'string') urls.add(instance.url);
	if (instance.uri !== undefined) {
		const apiUrl = parseHttpsUrl(instance.uri, `${path}.uri`);
		if (apiUrl && apiUrl.hostname !== instance.domain)
			fail(`${path}.uri`, 'hostname must match domain');
		if (apiUrl && apiUrl.pathname !== '/api/v2/instance')
			fail(`${path}.uri`, 'must point to /api/v2/instance');
	}

	if (!statuses.has(instance.status))
		fail(`${path}.status`, 'must be production, active, development, or maintenance');

	if (instance.featured !== undefined && typeof instance.featured !== 'boolean')
		fail(`${path}.featured`, 'must be a boolean');
}

if (errors.length > 0) {
	console.error(
		`Instance registry validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}:`
	);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`Validated ${registry.instances.length} SiliconBeest instance${registry.instances.length === 1 ? '' : 's'}.`
);
