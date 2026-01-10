<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<span class="text-xl font-bold text-[#002C5F]">PPDB SaaS Admin</span>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<a
							href="/admin"
							class="border-[#002C5F] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
						>
							Dashboard
						</a>
						<!-- Future links: Global Settings, Users, etc. -->
					</div>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:items-center">
					<div class="ml-3 relative">
						<div class="text-sm font-medium text-gray-500">Super Admin</div>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<main>
		<slot />
	</main>
</div>
