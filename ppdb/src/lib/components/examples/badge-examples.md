# Badge Component Examples

## Example 1: User Table with Role and Status Badges

```svelte
<script>
	import { Badge } from '$lib/components/ui';
	import type { User } from '$lib/types';

	let users: User[] = $state([]);
</script>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Email</th>
			<th>Role</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		{#each users as user}
			<tr>
				<td>{user.name}</td>
				<td>{user.email}</td>
				<td>
					<Badge variant="role" role={user.role}>
						{user.role.replace('_', ' ')}
					</Badge>
				</td>
				<td>
					<Badge variant="status" status={user.status}>
						{user.status}
					</Badge>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
```

## Example 2: Application Status Timeline

```svelte
<script>
	import { Badge } from '$lib/components/ui';

	const timeline = [
		{ step: 'Submitted', status: 'approved', date: '2024-01-10' },
		{ step: 'Document Review', status: 'approved', date: '2024-01-12' },
		{ step: 'Interview', status: 'pending', date: '2024-01-15' },
		{ step: 'Final Decision', status: 'inactive', date: null }
	];
</script>

<div class="space-y-4">
	{#each timeline as item}
		<div class="flex items-center gap-4">
			<Badge variant="status" status={item.status}>
				{item.status}
			</Badge>
			<div>
				<p class="font-medium">{item.step}</p>
				{#if item.date}
					<p class="text-sm text-muted-foreground">{item.date}</p>
				{/if}
			</div>
		</div>
	{/each}
</div>
```

## Example 3: Task Priority List

```svelte
<script>
	import { Badge } from '$lib/components/ui';

	const tasks = [
		{ title: 'Fix critical bug', priority: 'urgent' },
		{ title: 'Review PRs', priority: 'high' },
		{ title: 'Update docs', priority: 'medium' },
		{ title: 'Refactor utils', priority: 'low' }
	];
</script>

<ul class="space-y-2">
	{#each tasks as task}
		<li class="flex items-center justify-between">
			<span>{task.title}</span>
			<Badge variant="priority" priority={task.priority}>
				{task.priority}
			</Badge>
		</li>
	{/each}
</ul>
```

## Example 4: Combining Multiple Badge Types

```svelte
<script>
	import { Badge } from '$lib/components/ui';

	const tickets = [
		{
			id: '#123',
			title: 'Login bug',
			priority: 'urgent',
			status: 'pending',
			assignee: { role: 'verifier' }
		},
		{
			id: '#124',
			title: 'UI improvement',
			priority: 'low',
			status: 'approved',
			assignee: { role: 'school_admin' }
		}
	];
</script>

<div class="space-y-4">
	{#each tickets as ticket}
		<div class="border rounded-lg p-4">
			<div class="flex items-start justify-between mb-2">
				<div>
					<span class="text-sm text-muted-foreground">{ticket.id}</span>
					<h3 class="font-medium">{ticket.title}</h3>
				</div>
				<Badge variant="priority" priority={ticket.priority}>
					{ticket.priority}
				</Badge>
			</div>

			<div class="flex gap-2">
				<Badge variant="status" status={ticket.status}>
					{ticket.status}
				</Badge>
				<Badge variant="role" role={ticket.assignee.role}>
					{ticket.assignee.role}
				</Badge>
			</div>
		</div>
	{/each}
</div>
```
