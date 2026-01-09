<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="min-h-screen bg-gray-50">
	{#if data.profile}
		<!-- School Profile Display -->
		<div class="container mx-auto px-4 py-12">
			{#if data.profile.bannerUrl}
				<div class="w-full h-64 mb-8 rounded-lg overflow-hidden">
					<img
						src={data.profile.bannerUrl}
						alt="School Banner"
						class="w-full h-full object-cover"
					/>
				</div>
			{/if}

			<div class="bg-white shadow-lg rounded-lg p-8">
				<div class="flex items-center gap-6 mb-6">
					{#if data.profile.logoUrl}
						<img
							src={data.profile.logoUrl}
							alt="{data.profile.name} Logo"
							class="w-24 h-24 object-contain"
						/>
					{/if}

					<div>
						<h1
							class="text-4xl font-bold"
							style={data.profile.primaryColor
								? `color: ${data.profile.primaryColor}`
								: 'color: #002C5F'}
						>
							{data.profile.name}
						</h1>
						{#if data.profile.address}
							<p class="text-gray-600 mt-2">{data.profile.address}</p>
						{/if}
					</div>
				</div>

				{#if data.profile.description}
					<div class="mb-6">
						<h2 class="text-2xl font-semibold mb-3">About Us</h2>
						<p class="text-gray-700 leading-relaxed">{data.profile.description}</p>
					</div>
				{/if}

				{#if data.profile.contactEmail || data.profile.contactPhone}
					<div class="border-t pt-6">
						<h2 class="text-xl font-semibold mb-3">Contact Information</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if data.profile.contactEmail}
								<div>
									<span class="font-medium">Email:</span>
									<a
										href="mailto:{data.profile.contactEmail}"
										class="text-blue-600 hover:underline ml-2"
									>
										{data.profile.contactEmail}
									</a>
								</div>
							{/if}
							{#if data.profile.contactPhone}
								<div>
									<span class="font-medium">Phone:</span>
									<a
										href="tel:{data.profile.contactPhone}"
										class="text-blue-600 hover:underline ml-2"
									>
										{data.profile.contactPhone}
									</a>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<div class="mt-8 text-center">
					<a
						href="/register"
						class="inline-block px-8 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
						style={data.profile.primaryColor
							? `background-color: ${data.profile.primaryColor}`
							: 'background-color: #002C5F'}
					>
						Daftar Sekarang
					</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- Default Landing Page -->
		<div class="container mx-auto px-4 py-12">
			<div class="bg-white shadow-lg rounded-lg p-8 text-center">
				<h1 class="text-4xl font-bold mb-4">Welcome to PPDB Platform</h1>
				<p class="text-gray-600 mb-8">
					Multi-tenant school admission system. Configure your school profile to get started.
				</p>
				<a
					href="/admin/settings"
					class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Configure School Profile
				</a>
			</div>
		</div>
	{/if}
</div>
