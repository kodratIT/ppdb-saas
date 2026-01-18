<script lang="ts" context="module">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import * as AlertDialog from './alert-dialog/index.js';

	export {
		AlertDialogPrimitive,
		AlertDialog,
		//
		Root,
		Trigger,
		Portal,
		Content,
		Header,
		Footer,
		Title,
		Description,
		Action,
		Cancel
	};
</script>

<script lang="ts">
	import Root from './alert-dialog/alert-dialog.svelte';
	import Trigger from './alert-dialog/alert-dialog-trigger.svelte';
	import Portal from './alert-dialog/alert-dialog-portal.svelte';
	import Content from './alert-dialog/alert-dialog-content.svelte';
	import Header from './alert-dialog/alert-dialog-header.svelte';
	import Footer from './alert-dialog/alert-dialog-footer.svelte';
	import Title from './alert-dialog/alert-dialog-title.svelte';
	import Description from './alert-dialog/alert-dialog-description.svelte';
	import Action from './alert-dialog/alert-dialog-action.svelte';
	import Cancel from './alert-dialog/alert-dialog-cancel.svelte';
</script>
