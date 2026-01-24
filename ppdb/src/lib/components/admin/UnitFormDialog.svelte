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
	import { Plus, Pencil, Loader2, MapPin, Phone, School, Info, Building2 } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import type { Unit, Tenant, AdminUser, SchoolLevel, AccreditationType } from '$lib/types/admin';

	interface Props {
		open?: boolean;
		mode?: 'add' | 'edit';
		unit?: Unit;
		tenants?: Tenant[];
		user: AdminUser;
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		mode = 'add',
		unit = undefined,
		tenants = [],
		user,
		onClose
	}: Props = $props();

	let loading = $state(false);

	// Form field definitions
	const schoolLevels: { value: SchoolLevel; label: string }[] = [
		{ value: 'TK', label: i18n.t('admin.units.levels.TK') },
		{ value: 'SD', label: i18n.t('admin.units.levels.SD') },
		{ value: 'SMP', label: i18n.t('admin.units.levels.SMP') },
		{ value: 'SMA', label: i18n.t('admin.units.levels.SMA') },
		{ value: 'SMK', label: i18n.t('admin.units.levels.SMK') },
		{ value: 'Universitas', label: i18n.t('admin.units.levels.Universitas') },
		{ value: 'Lainnya', label: i18n.t('admin.units.levels.Lainnya') }
	];

	const accreditations: { value: AccreditationType; label: string }[] = [
		{ value: 'A', label: i18n.t('admin.units.accreditations.A') },
		{ value: 'B', label: i18n.t('admin.units.accreditations.B') },
		{ value: 'C', label: i18n.t('admin.units.accreditations.C') },
		{ value: 'Belum Terakreditasi', label: i18n.t('admin.units.accreditations.none') }
	];

	// Form state - synced with props for edit mode
	let selectedLevel = $state<string>(unit?.level || 'SD');
	let selectedAccreditation = $state<string>(unit?.accreditation || 'A');
	let selectedTenantId = $state<string>(unit?.tenantId || '');
	let formName = $state<string>(unit?.name || '');
	let formNpsn = $state<string>(unit?.npsn || '');
	let formContactPhone = $state<string>(unit?.contactPhone || '');
	let formAddress = $state<string>(unit?.address || '');

	// Reset form when unit changes or dialog opens
	$effect(() => {
		if (open) {
			if (mode === 'edit' && unit) {
				selectedLevel = unit.level || 'SD';
				selectedAccreditation = unit.accreditation || 'A';
				selectedTenantId = unit.tenantId || '';
				formName = unit.name || '';
				formNpsn = unit.npsn || '';
				formContactPhone = unit.contactPhone || '';
				formAddress = unit.address || '';
			} else if (mode === 'add') {
				// Reset to defaults for add mode
				selectedLevel = 'SD';
				selectedAccreditation = 'A';
				selectedTenantId = tenants.length > 0 && user.role === 'super_admin' ? tenants[0].id : '';
				formName = '';
				formNpsn = '';
				formContactPhone = '';
				formAddress = '';
			}
		}
	});

	// Handlers for Select components
	function handleLevelChange(value: string | undefined) {
		if (value) selectedLevel = value;
	}

	function handleAccreditationChange(value: string | undefined) {
		if (value) selectedAccreditation = value;
	}

	function handleTenantChange(value: string | undefined) {
		if (value) selectedTenantId = value;
	}

	// Label getters
	function getLevelLabel(value: string): string {
		return schoolLevels.find((l) => l.value === value)?.label || value;
	}

	function getAccLabel(value: string): string {
		return accreditations.find((a) => a.value === value)?.label || value;
	}

	function getTenantLabel(id: string): string {
		return tenants.find((t) => t.id === id)?.name || i18n.t('admin.units.allFoundations');
	}

	function handleClose() {
		open = false;
		onClose?.();
	}

	// Computed props
	const isEdit = $derived(mode === 'edit');
	const dialogTitle = $derived(
		isEdit ? i18n.t('admin.units.editUnit') : i18n.t('admin.units.addNewUnit')
	);
	const dialogDescription = $derived(
		isEdit
			? i18n.t('admin.units.editUnitDesc', { name: unit?.name || '' })
			: i18n.t('admin.units.addNewUnitDesc')
	);
	const formAction = $derived(isEdit ? '?/updateUnit' : '?/addUnit');
	const successMessage = $derived(
		isEdit ? i18n.t('admin.units.updateSuccess') : i18n.t('admin.units.addSuccess')
	);
	const errorMessage = $derived(
		isEdit ? i18n.t('admin.units.updateFailed') : i18n.t('admin.units.addFailed')
	);
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
	<Dialog.Content class="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>{dialogDescription}</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action={formAction}
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success(successMessage);
						handleClose();
						await update();
						await invalidateAll();
					} else if (result.type === 'failure') {
						// @ts-ignore
						toast.error(result.data?.error || errorMessage);
					}
				};
			}}
			class="space-y-6 py-4"
		>
			<!-- Hidden ID for edit mode -->
			{#if isEdit && unit}
				<input type="hidden" name="id" value={unit.id} />
			{/if}

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
						{#if !isEdit}
							<p class="text-[10px] text-muted-foreground">
								{i18n.t('admin.units.superAdminInfo')}
							</p>
						{/if}
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
							bind:value={formName}
							placeholder={i18n.t('admin.units.namePlaceholder')}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="npsn">{i18n.t('admin.units.npsnLabel')}</Label>
						<Input
							id="npsn"
							name="npsn"
							bind:value={formNpsn}
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
						<Input
							id="contactPhone"
							name="contactPhone"
							bind:value={formContactPhone}
							placeholder="0812xxxx"
							class="pl-9"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="address">{i18n.t('admin.units.fullAddress')}</Label>
					<Textarea
						id="address"
						name="address"
						bind:value={formAddress}
						placeholder={i18n.t('admin.units.addressPlaceholder')}
						rows={3}
					/>
					{#if !isEdit}
						<p class="text-[10px] text-muted-foreground flex items-center gap-1">
							<Info class="h-3 w-3" />
							{i18n.t('admin.units.addressInfo')}
						</p>
					{/if}
				</div>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={handleClose}>
					{i18n.t('common.cancel')}
				</Button>
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
