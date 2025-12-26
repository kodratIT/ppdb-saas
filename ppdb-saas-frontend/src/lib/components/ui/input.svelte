<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    class?: string;
    type?: "text" | "email" | "password" | "number";
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    id?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    class: className = "",
    type = "text",
    placeholder,
    value = $bindable(""),
    disabled = false,
    id,
    oninput,
    onchange,
    ...restProps
  }: Props = $props();
</script>

<input
  {type}
  {placeholder}
  {value}
  {disabled}
  {id}
  class={cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )}
  {oninput}
  {onchange}
  {...restProps}
/>
