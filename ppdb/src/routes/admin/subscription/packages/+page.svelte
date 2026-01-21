<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Plus, Pencil, Check, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	let isDialogOpen = $state(false);
	let editingPackage = $state<any>(null);

	function openCreateDialog() {
		editingPackage = null;
		isDialogOpen = true;
	}

	function openEditDialog(pkg: any) {
		editingPackage = pkg;
		isDialogOpen = true;
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.packages.title')}</h1>
			<p class="text-muted-foreground">{i18n.t('admin.packages.subtitle')}</p>
		</div>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('admin.packages.addPackage')}
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.packages.title')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('admin.packages.name')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.slug')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.priceMonthly')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.priceYearly')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
						<Table.Head class="text-right">{i18n.t('common.actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.packages as pkg}
						<Table.Row>
							<Table.Cell class="font-medium">{pkg.name}</Table.Cell>
							<Table.Cell>{pkg.slug}</Table.Cell>
							<Table.Cell>Rp {pkg.priceMonthly.toLocaleString('id-ID')}</Table.Cell>
							<Table.Cell>Rp {pkg.priceYearly.toLocaleString('id-ID')}</Table.Cell>
							<Table.Cell>
								<Badge variant={pkg.isActive ? 'default' : 'secondary'}>
									{pkg.isActive
										? i18n.t('admin.packages.active')
										: i18n.t('admin.packages.inactive')}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="icon" onclick={() => openEditDialog(pkg)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<form action="?/toggleActive" method="POST" use:enhance>
										<input type="hidden" name="id" value={pkg.id} />
										<input type="hidden" name="isActive" value={(!pkg.isActive).toString()} />
										<Button variant="ghost" size="icon" type="submit">
											{#if pkg.isActive}
												<X class="h-4 w-4 text-red-500" />
											{:else}
												<Check class="h-4 w-4 text-green-500" />
											{/if}
										</Button>
									</form>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title
					>{editingPackage
						? i18n.t('admin.packages.editPackage')
						: i18n.t('admin.packages.createPackage')}</Dialog.Title
				>
			</Dialog.Header>
			<form
				action={editingPackage ? '?/update' : '?/create'}
				method="POST"
				use:enhance
				onsubmit={() => (isDialogOpen = false)}
			>
				{#if editingPackage}
					<input type="hidden" name="id" value={editingPackage.id} />
				{/if}
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">{i18n.t('admin.packages.name')}</Label>
						<Input id="name" name="name" value={editingPackage?.name} class="col-span-3" required />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="slug" class="text-right">{i18n.t('admin.packages.slug')}</Label>
						<Input id="slug" name="slug" value={editingPackage?.slug} class="col-span-3" required />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="description" class="text-right"
							>{i18n.t('admin.packages.description')}</Label
						>
						<Textarea
							id="description"
							name="description"
							value={editingPackage?.description}
							class="col-span-3"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="priceMonthly" class="text-right">{i18n.t('admin.packages.priceMo')}</Label>
						<Input
							type="number"
							id="priceMonthly"
							name="priceMonthly"
							value={editingPackage?.priceMonthly}
							class="col-span-3"
							required
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="priceYearly" class="text-right">{i18n.t('admin.packages.priceYr')}</Label>
						<Input
							type="number"
							id="priceYearly"
							name="priceYearly"
							value={editingPackage?.priceYearly}
							class="col-span-3"
							required
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="limits" class="text-right">{i18n.t('admin.packages.limitsJson')}</Label>
						<Textarea
							id="limits"
							name="limits"
							value={JSON.stringify(editingPackage?.limits || {}, null, 2)}
							class="col-span-3 font-mono text-xs"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="features" class="text-right">{i18n.t('admin.packages.featuresJson')}</Label>
						<Textarea
							id="features"
							name="features"
							value={JSON.stringify(editingPackage?.features || [], null, 2)}
							class="col-span-3 font-mono text-xs"
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button type="submit">{i18n.t('admin.packages.saveChanges')}</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
