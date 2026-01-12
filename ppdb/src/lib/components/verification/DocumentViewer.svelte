<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		documentType: string;
	}

	let { src, alt, documentType }: Props = $props();

	let isModalOpen = $state(false);
	let scale = $state(1);

	function openModal() {
		isModalOpen = true;
		scale = 1;
	}

	function closeModal() {
		isModalOpen = false;
	}

	function zoomIn() {
		scale = Math.min(scale + 0.25, 3);
	}

	function zoomOut() {
		scale = Math.max(scale - 0.25, 0.5);
	}
</script>

<div class="document-viewer">
	<!-- Thumbnail View -->
	<button
		onclick={openModal}
		class="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-zoom-in group"
	>
		<img {src} {alt} class="w-full h-full object-contain" />
		<div
			class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center"
		>
			<div
				class="opacity-0 group-hover:opacity-100 bg-white rounded-full p-3 shadow-lg transition-opacity"
			>
				<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
					/>
				</svg>
			</div>
		</div>
	</button>

	<div class="mt-2 text-sm text-gray-600">
		<span class="font-medium">{documentType}</span>
	</div>

	<!-- Modal Viewer -->
	{#if isModalOpen}
		<div
			class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
			onclick={closeModal}
		>
			<div class="relative max-w-7xl w-full h-full flex flex-col">
				<!-- Controls -->
				<div class="flex items-center justify-between mb-4 bg-gray-800 rounded-lg p-3">
					<div class="flex items-center gap-2">
						<button
							onclick={(e) => {
								e.stopPropagation();
								zoomOut();
							}}
							class="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
							title="Zoom Out"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20 12H4"
								/>
							</svg>
						</button>
						<span class="text-white text-sm font-mono">{Math.round(scale * 100)}%</span>
						<button
							onclick={(e) => {
								e.stopPropagation();
								zoomIn();
							}}
							class="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
							title="Zoom In"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</button>
					</div>

					<button
						onclick={(e) => {
							e.stopPropagation();
							closeModal();
						}}
						class="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
						title="Close"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Image Container -->
				<div
					class="flex-1 overflow-auto bg-gray-900 rounded-lg flex items-center justify-center"
					onclick={(e) => e.stopPropagation()}
				>
					<img
						{src}
						{alt}
						class="transition-transform duration-200"
						style="transform: scale({scale})"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.document-viewer {
		@apply w-full;
	}
</style>
