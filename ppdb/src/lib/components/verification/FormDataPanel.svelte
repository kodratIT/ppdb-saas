<script lang="ts">
	interface Props {
		application: any;
	}

	let { application }: Props = $props();

	function formatDate(date: Date | string | null): string {
		if (!date) return '-';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	const sections = [
		{
			title: 'Data Anak',
			fields: [
				{ label: 'Nama Lengkap', value: application.childFullName },
				{ label: 'Nama Panggilan', value: application.childNickname },
				{ label: 'Tanggal Lahir', value: formatDate(application.childDob) },
				{
					label: 'Jenis Kelamin',
					value:
						application.childGender === 'male'
							? 'Laki-laki'
							: application.childGender === 'female'
								? 'Perempuan'
								: '-'
				}
			]
		},
		{
			title: 'Data Orang Tua',
			fields: [
				{ label: 'Nama Lengkap', value: application.parentFullName },
				{ label: 'Nomor WhatsApp', value: application.parentPhone },
				{ label: 'Email', value: application.parentEmail || '-' }
			]
		},
		{
			title: 'Alamat',
			fields: [
				{ label: 'Alamat Lengkap', value: application.address },
				{ label: 'Kota', value: application.city },
				{ label: 'Provinsi', value: application.province },
				{ label: 'Kode Pos', value: application.postalCode || '-' }
			]
		},
		{
			title: 'Informasi Pendaftaran',
			fields: [
				{ label: 'Jalur Pendaftaran', value: application.admissionPath?.name || '-' },
				{ label: 'Status', value: application.status },
				{ label: 'Tanggal Daftar', value: formatDate(application.createdAt) },
				{ label: 'Tanggal Submit', value: formatDate(application.submittedAt) }
			]
		}
	];
</script>

<div class="form-data-panel bg-white rounded-lg border border-gray-200 p-6 space-y-6">
	<div class="border-b pb-4">
		<h2 class="text-xl font-bold text-gray-900">Application Data</h2>
		<p class="text-sm text-gray-500 mt-1">
			ID: <span class="font-mono">{application.id}</span>
		</p>
	</div>

	{#each sections as section}
		<div class="space-y-3">
			<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
				{section.title}
			</h3>
			<dl class="grid grid-cols-1 gap-3">
				{#each section.fields as field}
					<div class="flex flex-col">
						<dt class="text-xs text-gray-500 font-medium">{field.label}</dt>
						<dd class="text-sm text-gray-900 mt-1 font-medium">
							{field.value || '-'}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/each}

	<!-- Custom Fields (if any) -->
	{#if application.customFieldValues}
		{@const customData = JSON.parse(application.customFieldValues)}
		{#if Object.keys(customData).length > 0}
			<div class="space-y-3 pt-4 border-t">
				<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
					Informasi Tambahan
				</h3>
				<dl class="grid grid-cols-1 gap-3">
					{#each Object.entries(customData) as [key, value]}
						<div class="flex flex-col">
							<dt class="text-xs text-gray-500 font-medium capitalize">{key.replace(/_/g, ' ')}</dt>
							<dd class="text-sm text-gray-900 mt-1 font-medium">
								{value || '-'}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}
	{/if}
</div>

<style>
	.form-data-panel {
		max-height: calc(100vh - 12rem);
		overflow-y: auto;
	}
</style>
