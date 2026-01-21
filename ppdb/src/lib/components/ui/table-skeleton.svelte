<script lang="ts">
	import * as Table from './table.ts';
	import Skeleton from './skeleton.svelte';

	interface Column {
		key: string;
		label?: string;
		width?: string;
		align?: 'left' | 'center' | 'right';
		skeletonWidth?: string;
		skeletonHeight?: string;
	}

	interface Props {
		columns: Column[];
		rows?: number;
		showCheckbox?: boolean;
		showActions?: boolean;
	}

	let { columns, rows = 5, showCheckbox = false, showActions = false }: Props = $props();

	const getAlignClass = (align?: 'left' | 'center' | 'right') => {
		if (align === 'center') return 'text-center';
		if (align === 'right') return 'text-right';
		return 'text-left';
	};

	const getSkeletonAlignClass = (align?: 'left' | 'center' | 'right') => {
		if (align === 'center') return 'mx-auto';
		if (align === 'right') return 'ml-auto';
		return '';
	};
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			{#if showCheckbox}
				<Table.Head class="w-12 px-4">
					<Skeleton class="h-4 w-4" />
				</Table.Head>
			{/if}

			{#each columns as column}
				<Table.Head
					class="{getAlignClass(column.align)} {column.width ? '' : 'flex-1'}"
					style={column.width ? `width: ${column.width}` : ''}
				>
					{column.label || ''}
				</Table.Head>
			{/each}

			{#if showActions}
				<Table.Head class="w-12 px-4 text-right">Actions</Table.Head>
			{/if}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each Array(rows) as _, i (i)}
			<Table.Row>
				{#if showCheckbox}
					<Table.Cell class="px-4">
						<Skeleton class="h-4 w-4" />
					</Table.Cell>
				{/if}

				{#each columns as column}
					<Table.Cell class={getAlignClass(column.align)}>
						<Skeleton
							class="h-4 {column.skeletonWidth || 'w-24'} {getSkeletonAlignClass(
								column.align
							)} rounded"
							style={column.skeletonHeight ? `height: ${column.skeletonHeight}` : ''}
						/>
					</Table.Cell>
				{/each}

				{#if showActions}
					<Table.Cell class="px-4 text-right">
						<Skeleton class="h-8 w-8 ml-auto rounded-md" />
					</Table.Cell>
				{/if}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
