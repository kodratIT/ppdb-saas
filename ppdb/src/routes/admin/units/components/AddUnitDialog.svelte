<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2, MapPin, Phone, School, Info, Building2 } from 'lucide-svelte';

	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		tenants?: any[];
		user: any;
	}

	let { tenants = [], user }: Props = $props();

	let open = $state(false);
	let loading = $state(false);

	const schoolLevels = [
		{ value: 'TK', label: i18n.t('admin.units.levels.TK') },
		{ value: 'SD', label: i18n.t('admin.units.levels.SD') },
		{ value: 'SMP', label: i18n.t('admin.units.levels.SMP') },
		{ value: 'SMA', label: i18n.t('admin.units.levels.SMA') },
		{ value: 'SMK', label: i18n.t('admin.units.levels.SMK') },
		{ value: 'Universitas', label: i18n.t('admin.units.levels.Universitas') },
		{ value: 'Lainnya', label: i18n.t('admin.units.levels.Lainnya') }
	];

	const accreditations = [
		{ value: 'A', label: i18n.t('admin.units.accreditations.A') },
		{ value: 'B', label: i18n.t('admin.units.accreditations.B') },
		{ value: 'C', label: i18n.t('admin.units.accreditations.C') },
		{ value: 'Belum Terakreditasi', label: i18n.t('admin.units.accreditations.none') }
	];

	let selectedLevel = $state('SD');
	let selectedAccreditation = $state('A');
	let selectedTenantId = $state('');

	// Set default tenant if not super_admin or when open
	$effect(() => {
		if (open && user.role === 'super_admin' && tenants.length > 0 && !selectedTenantId) {
			selectedTenantId = tenants[0].id;
		}
	});

	function handleLevelChange(value: string) {
		selectedLevel = value;
	}

	function handleAccreditationChange(value: string) {
		selectedAccreditation = value;
	}

	function handleTenantChange(value: string) {
		selectedTenantId = value;
	}

	function getLevelLabel(value: string) {
		return schoolLevels.find((l) => l.value === value)?.label || value;
	}

	function getAccLabel(value: string) {
		return accreditations.find((a) => a.value === value)?.label || value;
	}

	function getTenantLabel(id: string) {
		return tenants.find((t) => t.id === id)?.name || i18n.t('admin.units.allFoundations');
	}
</script>

<Button onclick={() => (open = true)}>
	<Plus class="mr-2 h-4 w-4" />
	{i18n.t('admin.units.addUnit')}
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{i18n.t('admin.units.addNewUnit')}</Dialog.Title>
			<Dialog.Description>
				{i18n.t('admin.units.addNewUnitDesc')}
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/addUnit"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success(i18n.t('admin.units.addSuccess'));
						open = false;
						await update();
						await invalidateAll();
					} else if (result.type === 'failure') {
						// @ts-ignore
						toast.error(result.data?.error || i18n.t('admin.units.addFailed'));
					}
				};
			}}
			class="space-y-6 py-4"
		>
			<!-- Super Admin: Tenant Selection -->
			{#if user.role === 'super_admin'}
				<div class="space-y-4 bg-muted/30 p-4 rounded-lg border border-dashed">
					<h4 class="text-sm font-semibold flex items-center gap-2 text-blue-600">
						<Building2 class="h-4 w-4" />
						{i18n.t('admin.units.foundationRelation')}
					</h4>
					<div class="space-y-2">
						<Label for="tenantId">{i18n.t('admin.units.selectFoundation')}</Label>
						<Select type="single" value={selectedTenantId} onValueChange={handleTenantChange}>
							<SelectTrigger id="tenantId">
								{getTenantLabel(selectedTenantId)}
							</SelectTrigger>
							<SelectContent>
								{#each tenants as tenant}
									<SelectItem value={tenant.id}>{tenant.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<input type="hidden" name="tenantId" value={selectedTenantId} />
						<p class="text-[10px] text-muted-foreground">
							{i18n.t('admin.units.superAdminInfo')}
						</p>
					</div>
				</div>
			{/if}

			<!-- Informasi Dasar -->
			<div class="space-y-4">
				<h4 class="text-sm font-semibold flex items-center gap-2 text-primary">
					<School class="h-4 w-4" />
					{i18n.t('admin.units.identityInfo')}
				</h4>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="name">{i18n.t('admin.units.nameLabel')}</Label>
						<Input
							id="name"
							name="name"
							placeholder={i18n.t('admin.units.namePlaceholder')}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="npsn">{i18n.t('admin.units.npsnLabel')}</Label>
						<Input
							id="npsn"
							name="npsn"
							placeholder={i18n.t('admin.units.npsnPlaceholder')}
							maxlength={8}
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="level">{i18n.t('admin.units.levelLabel')}</Label>
						<Select type="single" value={selectedLevel} onValueChange={handleLevelChange}>
							<SelectTrigger id="level">
								{getLevelLabel(selectedLevel)}
							</SelectTrigger>
							<SelectContent>
								{#each schoolLevels as level}
									<SelectItem value={level.value}>{level.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<input type="hidden" name="level" value={selectedLevel} />
					</div>
					<div class="space-y-2">
						<Label for="accreditation">{i18n.t('admin.units.accreditationLabel')}</Label>
						<Select
							type="single"
							value={selectedAccreditation}
							onValueChange={handleAccreditationChange}
						>
							<SelectTrigger id="accreditation">
								{getAccLabel(selectedAccreditation)}
							</SelectTrigger>
							<SelectContent>
								{#each accreditations as acc}
									<SelectItem value={acc.value}>{acc.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<input type="hidden" name="accreditation" value={selectedAccreditation} />
					</div>
				</div>
			</div>

			<!-- Kontak & Lokasi -->
			<div class="space-y-4 pt-2 border-t">
				<h4 class="text-sm font-semibold flex items-center gap-2 text-primary">
					<MapPin class="h-4 w-4" />
					{i18n.t('admin.units.contactLocation')}
				</h4>

				<div class="space-y-2">
					<Label for="contactPhone">{i18n.t('admin.units.waAdmin')}</Label>
					<div class="relative">
						<Phone class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input id="contactPhone" name="contactPhone" placeholder="0812xxxx" class="pl-9" />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="address">{i18n.t('admin.units.fullAddress')}</Label>
					<Textarea
						id="address"
						name="address"
						placeholder={i18n.t('admin.units.addressPlaceholder')}
						rows={3}
					/>
					<p class="text-[10px] text-muted-foreground flex items-center gap-1">
						<Info class="h-3 w-3" />
						{i18n.t('admin.units.addressInfo')}
					</p>
				</div>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (open = false)}
					>{i18n.t('common.cancel')}</Button
				>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{i18n.t('common.saving')}
					{:else}
						{i18n.t('common.save')}
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
