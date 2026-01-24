<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Phone, Send, Copy, X, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		message: string;
		variables?: Record<string, string>;
		open?: boolean;
		onSendTest?: (phone: string) => void;
		onClose?: () => void;
	}

	let {
		message = '',
		variables = {},
		open = $bindable(false),
		onSendTest,
		onClose
	} = $props<Props>();

	let testPhone = $state('');
	let copied = $state(false);

	let processedMessage = $derived.by(() => {
		let result = message;
		// Default mock variables if none provided
		const defaultVars = {
			admin_name: 'Budi Santoso',
			school_name: 'SMA Mutiara Bangsa',
			login_url: 'https://sma-mutiara.ppdb.id/admin',
			current_date: new Date().toLocaleDateString('id-ID'),
			...variables
		};

		Object.entries(defaultVars).forEach(([key, value]) => {
			result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
		});
		return result;
	});

	function handleCopy() {
		navigator.clipboard.writeText(processedMessage);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleSendTest() {
		if (onSendTest && testPhone) {
			onSendTest(testPhone);
		}
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[450px] p-0 overflow-hidden border-none bg-transparent shadow-none"
	>
		<div
			class="bg-[#e5ded8] rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl border-8 border-slate-900"
		>
			<!-- WA Header -->
			<div class="bg-[#075e54] p-4 text-white flex items-center gap-3">
				<div
					class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold"
				>
					P
				</div>
				<div class="flex-1">
					<p class="font-bold text-sm">PPDB SAAS Center</p>
					<p class="text-[10px] opacity-80">Online</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="text-white hover:bg-white/10 h-8 w-8"
					onclick={() => (open = false)}
				>
					<X class="w-4 h-4" />
				</Button>
			</div>

			<!-- Chat Area -->
			<div
				class="flex-1 overflow-y-auto p-4 space-y-4 bg-repeat"
				style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-size: 400px;"
			>
				<div
					class="bg-white rounded-lg p-3 text-[13px] leading-relaxed shadow-sm max-w-[85%] relative animate-in fade-in slide-in-from-bottom-2"
				>
					<p class="whitespace-pre-wrap">{processedMessage}</p>
					<div class="flex justify-end items-center gap-1 mt-1">
						<span class="text-[9px] text-slate-400">{formatTime(new Date())}</span>
						<Check class="w-3 h-3 text-blue-400" />
					</div>
					<!-- Tail -->
					<div
						class="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"
					></div>
				</div>
			</div>

			<!-- Preview Footer -->
			<div class="bg-[#f0f2f5] p-6 border-t shrink-0">
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
							Live Preview
						</p>
						<Button
							variant="ghost"
							size="sm"
							class="h-6 text-[10px] font-bold uppercase"
							onclick={handleCopy}
						>
							{#if copied}
								<Check class="w-3 h-3 mr-1 text-emerald-500" /> Copied
							{:else}
								<Copy class="w-3 h-3 mr-1" /> Copy Text
							{/if}
						</Button>
					</div>

					<div class="space-y-2">
						<Label class="text-[10px] font-black uppercase tracking-widest">Send Test Message</Label
						>
						<div class="flex gap-2">
							<div class="relative flex-1">
								<Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
								<Input
									bind:value={testPhone}
									placeholder="WhatsApp Number..."
									class="h-9 pl-9 text-xs bg-white border-slate-200"
								/>
							</div>
							<Button
								size="sm"
								class="h-9 px-4 text-xs font-bold uppercase tracking-wider"
								onclick={handleSendTest}
								disabled={!testPhone}
							>
								<Send class="w-3 h-3 mr-2" />
								Send
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Custom WA Background Patterns */
</style>
