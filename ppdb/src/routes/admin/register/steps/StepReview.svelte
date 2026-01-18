<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { RegistrationFormData } from '../schema';

	interface Props {
		formData: Partial<RegistrationFormData>;
	}

	let { formData }: Props = $props();
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold mb-2">Review & Submit 📋</h2>
		<p class="text-sm text-muted-foreground">
			Please review all information before submitting. You can go back to edit any section.
		</p>
	</div>

	<!-- School Identity -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">School Identity</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-muted-foreground">School Name</p>
					<p class="font-medium">{formData.name || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">NPSN</p>
					<p class="font-medium">{formData.npsn || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Slug</p>
					<p class="font-medium font-mono text-sm">{formData.slug || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Level</p>
					<p class="font-medium">{formData.level || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Status</p>
					<Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
						{formData.status || '-'}
					</Badge>
				</div>
			</div>
			<div class="pt-2 border-t">
				<p class="text-sm text-muted-foreground">Subdomain</p>
				<p class="font-medium text-primary">
					{formData.slug || 'your-school'}.ppdb.id
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Location -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">Location</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-muted-foreground">Province</p>
					<p class="font-medium">{formData.province || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">City/Regency</p>
					<p class="font-medium">{formData.city || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">District</p>
					<p class="font-medium">{formData.district || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Village</p>
					<p class="font-medium">{formData.village || '-'}</p>
				</div>
			</div>
			<div class="pt-2 border-t">
				<p class="text-sm text-muted-foreground">Street Address</p>
				<p class="font-medium">{formData.address || '-'}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Postal Code</p>
				<p class="font-medium">{formData.postalCode || '-'}</p>
			</div>
		</CardContent>
	</Card>

	<!-- Admin Account -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">Admin Account</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-muted-foreground">Admin Name</p>
					<p class="font-medium">{formData.adminName || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Email</p>
					<p class="font-medium">{formData.email || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">WhatsApp</p>
					<p class="font-medium">{formData.whatsapp || '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Password</p>
					<p class="font-medium">••••••••</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Important Notice -->
	<div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
		<div class="flex gap-3">
			<div class="text-blue-600 dark:text-blue-400">
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>
			<div class="flex-1">
				<h4 class="font-medium text-blue-900 dark:text-blue-100 mb-1">Before you submit</h4>
				<p class="text-sm text-blue-800 dark:text-blue-200">
					Make sure all information is correct. After submission, a new tenant will be created with
					the admin account. You'll be able to log in immediately after registration is complete.
				</p>
			</div>
		</div>
	</div>
</div>
