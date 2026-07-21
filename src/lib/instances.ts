export type InstanceStatus = 'production' | 'active' | 'development' | 'maintenance';
export type RegistrationMode = 'open' | 'approval' | 'referral' | 'closed';
export type LiveRegistrationMode = RegistrationMode | 'loading' | 'unavailable';

export type SiliconBeestInstance = {
	name: string;
	domain: string;
	url: string;
	uri?: string;
	status: InstanceStatus;
	featured?: boolean;
};

export type ListedSiliconBeestInstance = SiliconBeestInstance & {
	description: string;
	languages: string[];
	sourceUrl: string | null;
	thumbnailUrl: string | null;
	registration: LiveRegistrationMode;
	apiUrl: string;
	metadataStatus: 'loading' | 'available' | 'unavailable';
};

export const registryRepository = 'https://github.com/SJang1/siliconbeest-io';

export function statusLabel(status: InstanceStatus): string {
	return {
		production: 'Production',
		active: 'Active',
		development: 'Development',
		maintenance: 'Maintenance'
	}[status];
}

export function registrationLabel(mode: LiveRegistrationMode): string {
	return {
		open: 'Open registration',
		approval: 'Approval required',
		referral: 'Referral required',
		closed: 'Registration closed',
		loading: 'Checking registration…',
		unavailable: 'Status unavailable'
	}[mode];
}
