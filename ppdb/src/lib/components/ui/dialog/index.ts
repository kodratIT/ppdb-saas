import Root from './Dialog.svelte';
import Trigger from './DialogTrigger.svelte';
import Content from './DialogContent.svelte';
import Header from './DialogHeader.svelte';
import Title from './DialogTitle.svelte';
import Description from './DialogDescription.svelte';
import Footer from './DialogFooter.svelte';

export {
	Root,
	Trigger,
	Content,
	Header,
	Title,
	Description,
	Footer,
	// Also export as individual names for flexibility
	Root as Dialog,
	Trigger as DialogTrigger,
	Content as DialogContent,
	Header as DialogHeader,
	Title as DialogTitle,
	Description as DialogDescription,
	Footer as DialogFooter
};
