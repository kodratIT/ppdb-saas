<script lang="ts">
	import { ReviewCard, ReviewField } from '$lib/components/ui/review';
	import Alert from '$lib/components/ui/alert.svelte';
	import type { RegistrationFormData } from '../schema';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		formData: Partial<RegistrationFormData>;
		onEditSection?: (step: number) => void;
	}

	let { formData, onEditSection }: Props = $props();

	// Helper functions
	function getTypeLabel(type?: string) {
		return type === 'foundation'
			? i18n.t('admin.register.foundation')
			: i18n.t('admin.register.singleSchool');
	}

	// Data safely accessed
	const data = (formData || {}) as Partial<RegistrationFormData>;
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-xl font-semibold mb-2">{i18n.t('admin.register.stepReview')} 📋</h2>
		<p class="text-sm text-muted-foreground">
			{i18n.t('admin.register.reviewSubmit')}
		</p>
	</div>

	<!-- School Identity -->
	<ReviewCard
		title={i18n.t('admin.register.stepIdentity')}
		icon="🏫"
		onEdit={() => onEditSection?.(1)}
	>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField
				label={i18n.t('admin.register.institutionType')}
				value={getTypeLabel(data.type)}
			/>
			<ReviewField
				label={data.type === 'foundation'
					? i18n.t('admin.register.foundationName')
					: i18n.t('admin.register.schoolName')}
				value={data.name}
			/>
			<ReviewField label={i18n.t('admin.register.npsn')} value={data.npsn} />
			<ReviewField
				label={data.type === 'foundation'
					? i18n.t('admin.register.foundationSlug')
					: i18n.t('admin.register.slug')}
				value={data.slug}
				mono
			/>
			<ReviewField label={i18n.t('admin.register.level')} value={data.level} />
			<ReviewField
				label={i18n.t('admin.register.status')}
				badge={{
					label:
						data.status === 'active'
							? i18n.t('admin.register.active')
							: i18n.t('admin.register.inactive'),
					variant: data.status === 'active' ? 'default' : 'secondary'
				}}
			/>
		</div>
		<div class="pt-3 mt-3 border-t">
			<ReviewField
				label={i18n.t('admin.register.subdomain')}
				value={`${data.slug || (data.type === 'foundation' ? 'your-foundation' : 'your-school')}.ppdb.id`}
				highlight
			/>
		</div>
	</ReviewCard>

	<!-- Location -->
	<ReviewCard
		title={i18n.t('admin.register.stepLocation')}
		icon="📍"
		onEdit={() => onEditSection?.(2)}
	>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField label={i18n.t('admin.register.province')} value={data.province} />
			<ReviewField label={i18n.t('admin.register.city')} value={data.city} />
			<ReviewField label={i18n.t('admin.register.district')} value={data.district} />
			<ReviewField label={i18n.t('admin.register.village')} value={data.village} />
		</div>
		<div class="pt-3 mt-3 border-t space-y-3">
			<ReviewField label={i18n.t('admin.register.streetAddress')} value={data.address} />
			<ReviewField label={i18n.t('admin.register.postalCode')} value={data.postalCode} />
		</div>
	</ReviewCard>

	<!-- Admin Account -->
	<ReviewCard
		title={i18n.t('admin.register.stepAdmin')}
		icon="👤"
		onEdit={() => onEditSection?.(3)}
	>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField label={i18n.t('admin.register.adminName')} value={data.adminName} />
			<ReviewField label={i18n.t('admin.register.adminEmail')} value={data.email} />
			<ReviewField label={i18n.t('admin.register.whatsapp')} value={data.whatsapp} />
			<ReviewField label={i18n.t('admin.register.adminPassword')} masked />
		</div>
	</ReviewCard>

	<!-- Important Notice -->
	<Alert variant="info" message={i18n.t('admin.register.submitNotice')} />
</div>
